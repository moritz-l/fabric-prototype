import requests
import cryptography
import base64
import binascii
import json      
import os 
import errno

from pathlib import Path

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

from Crypto.Cipher import AES
from Crypto import Random
from Crypto.Util import Counter


msp1_base_url = 'http://localhost:1337'
msp2_base_url = 'http://localhost:2337'

# encrypt any data with aes
def encrypt_text_with_aes(data):
    assert len(data) > 0

    key = Random.get_random_bytes(32)

    # Choose a random, 16-byte IV.
    iv = Random.new().read(AES.block_size)
    
    # Convert the IV to a Python integer.
    iv_int = int(binascii.hexlify(iv), 16) 

    # Create a new Counter object with IV = iv_int.
    ctr = Counter.new(
        AES.block_size * 8, 
        initial_value=iv_int
    )

    # Create AES-CTR cipher.
    aes = AES.new(
        key, 
        AES.MODE_CTR, 
        counter=ctr
    )

    ciphertext = aes.encrypt(data)
    return(key, iv, ciphertext)

# decrypt any data with aes
def decrypt_text_with_aes(iv, key, ciphertext):
    assert len(key) == 32

    # iv_int = int(iv.encode('hex'), 16)
    iv_int = int(binascii.hexlify(iv), 16) 

    # Initialize counter for decryption
    ctr = Counter.new(
        AES.block_size * 8, 
        initial_value=iv_int
    )

    # Create AES-CTR cipher.
    aes = AES.new(key, 
        AES.MODE_CTR, 
        counter=ctr
    )

    # Decrypt and return the plaintext.
    plaintext = aes.decrypt(ciphertext)

    return plaintext

# enroll a member and keep the private key in memory
def enroll_member(orgname, file_name, base_url):
    request_url = base_url + '/members/enroll/' + orgname
    response = requests.post(request_url)
    file_path = file_name

    if response.status_code == 200:
        json_result = response.json()
        private_key = json_result['privateKey']
        private_key_bytes = private_key.encode()

        print(base_url, ':', 'Member', orgname, 'enrolled')

        if private_key_bytes is not None:
            print('Saving private key to file', file_path)

            if not os.path.exists(os.path.dirname(file_path)):
                try:
                    os.makedirs(os.path.dirname(file_path))
                except OSError as exc: # Guard against race condition
                    if exc.errno != errno.EEXIST:
                        raise

            with open(file_path, 'wb') as f:
                f.write(private_key_bytes)

            return file_path
    else: 
        print('GET request on', request_url, 'finished with', response.status_code)

# read a single invoice
def read_invoice(invoice_key, base_url):
    request_url = base_url + '/invoice/' + invoice_key
    response = requests.get(request_url)

    if response.status_code == 200:
        json_result = response.json()
        
        invoice = ''
        private_data = ''

        try:
            if 'invoice' in json_result:
                invoice = json_result['invoice']

            if 'privateData' in json_result:
                private_data = json_result['privateData']

        except:
            print('Error reading JSON response')

        print(base_url, ':', 'Invoice', invoice_key, 'received')
        return (invoice, private_data)
    else: 
        print('GET request on', request_url, 'finished with', response.status_code)

# read the list of all invoices
def read_list_of_invoices(base_url):
    request_url = base_url + '/invoices/list'
    response = requests.get(request_url)

    if response.status_code == 200:
        json_result = response.json()
        return json_result

    else: 
        print('GET request on', request_url, 'finished with', response.status_code)

# create a new invoice
def create_invoice(invoice_number, sender, receiver, private_data, base_url):
    request_url = base_url + '/invoices/new'

    # encrypt the data
    (key, iv, cipher) = encrypt_text_with_aes(private_data)       
    print('Encrypted the file using AES')


    # cipher_plain = cipher.decode('latin-1')
    cipher_b64 = binascii.b2a_base64(cipher).decode('utf-8').strip()
    iv_b64 = binascii.b2a_base64(iv).decode('utf-8').strip()

    # encrypt the AES key
    encrypted_key = encrypt_with_public_key(receiver, key, base_url)
    encrypted_key_b64 = binascii.b2a_base64(encrypted_key).decode('utf-8').strip()

    # create the payload
    payload = {
        'invoiceno': invoice_number,
        'sender': sender,
        'receiver': receiver,
        'encryptedData': cipher_b64,
        'key': encrypted_key_b64,
        'iv': iv_b64,
    }

    # create the header
    headers = {
        'content-type': 'application/json'
    }

    # send the request
    response = requests.post(request_url, data=json.dumps(payload), headers=headers)
    
    if response.status_code == 200:
        print(base_url, ':', 'Invoice', invoice_number, 'created')
    else:
        print('POST request on', request_url, 'finished with', response.status_code)


# enrypt with a members key
def encrypt_with_public_key(orgname, data, base_url) -> str:
    request_url = base_url + '/members/certificate/' + orgname
    response = requests.get(request_url)

    if response.status_code == 200:
        print(base_url, ':', 'Public key for', orgname, 'received')

        json_result = response.json()

        public_key = json_result['memberKey']

        public_key_serialized = serialization.load_pem_public_key(
            public_key.encode(),
            backend=default_backend()
        )
        
        encrypted = public_key_serialized.encrypt(
            data,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

        print('Encrypted the AES-Key with public key provided by', orgname)

        return encrypted
    else:     
        print('GET request on', request_url, 'finished with', response.status_code)

# decrypt with a private key file
def decrypt_with_private_key(file_name, encrypted_data) -> str:
    try:
        with open(file_name, 'rb') as private_key_file:
            private_key_serialized = serialization.load_pem_private_key(
                private_key_file.read(),
                backend=default_backend(),
                password=None         
            ) 
        
        decrypted_data = private_key_serialized.decrypt(
            encrypted_data,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

        print('Decrypted the AES-Key with private key from file', file_name)

        return decrypted_data

    except IOError:
        print('Error when reading file', file_name)

# read a file into a string
def read_string_from_file(file_name):
    file = open(file_name, 'rb').read()
    return file.decode('latin-1')

# decrypt private_data
def decrypt_private_data(private_data, private_key_file_name):
    # convert back from base64 to bytes
    iv_b64 = private_data['iv']
    iv = binascii.a2b_base64(iv_b64)

    encrypted_key_b64 = private_data['key']
    encrypted_key = binascii.a2b_base64(encrypted_key_b64)

    encrypted_data_b64 = private_data['encryptedData'] 
    encrypted_data = binascii.a2b_base64(encrypted_data_b64)

    # decrypt the AES-Key
    decrypted_key = decrypt_with_private_key(private_key_file_name, encrypted_key)

    # decrypt the data
    decrypted_data = decrypt_text_with_aes(iv, decrypted_key, encrypted_data)

    print('Decrypted the file with the AES-Key')

    return decrypted_data


# create a new organisations 
def create_organisation(orgname, base_url):
    private_key_file = './' + orgname + '_key_store/' + 'private_key.pem'

    file_name = enroll_member(orgname, private_key_file, base_url)
    return file_name

# test case
def _test_case(sender, sender_url, receiver, receiver_url, invoice_number):
    # check sender
    sender_key_file_name = './' + sender + '_key_store/private_key.pem'
    sender_pem_key_file = Path(sender_key_file_name)
    if not sender_pem_key_file.is_file():
        sender_key_file_name = create_organisation(sender, sender_url)

    # check receiver
    receiver_key_file_name = './' + receiver + '_key_store/private_key.pem'
    receiver_pem_key_file = Path(receiver_key_file_name)
    if not receiver_pem_key_file.is_file():
        receiver_key_file_name = create_organisation(receiver, receiver_url)

    # read the sample xml
    sample_file = Path('./sample_files/Sample-XML-Files.xml')
    if not sample_file.is_file():
        print('No sample file found')

    sample_file = read_string_from_file('./sample_files/Sample-XML-Files.xml')

    # create a new invoice and use the xml as private data
    create_invoice(invoice_number, sender, receiver, sample_file, sender_url)

    # read the file as the receiving organisation
    invoice_key = sender + '_' + receiver + '_' + invoice_number
    (invoice, private_data) = read_invoice(invoice_key, receiver_url)

    if invoice_key:
        print('Public invoice data received')
    else:
        print('No public invoice data received')

    if private_data:
        print('Private invoice data received')

        # decrypt the private data
        decrypted_file = decrypt_private_data(private_data, receiver_pem_key_file)

        # save the decrypted file
        file_path = './' + receiver + '_files/' + invoice_number + '.xml'

        if decrypted_file:
            if not os.path.exists(os.path.dirname(file_path)):
                try:
                    os.makedirs(os.path.dirname(file_path))
                except OSError as exc: # Guard against race condition
                    if exc.errno != errno.EEXIST:
                        raise

            with open(file_path, 'wb') as f:
                f.write(decrypted_file)
        
            print('File stored to', file_path)
        else:
            print('No file decrypted')
    else:
        print('No private data received')


_test_case('Org18', msp1_base_url, 'Org19', msp2_base_url, '100029')



