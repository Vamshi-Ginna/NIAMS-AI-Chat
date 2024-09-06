import logging
import requests
import jwt
from fastapi import HTTPException, Security
from fastapi.security import OAuth2AuthorizationCodeBearer
from jwt.algorithms import RSAAlgorithm
from config import Config

# Configure logging
logger = logging.getLogger(__name__)

# Azure AD Configuration
AZURE_TENANT_ID = Config.AZURE_TENANT_ID
AZURE_CLIENT_ID = Config.AZURE_CLIENT_ID
API_AUDIENCE = Config.API_AUDIENCE # Application ID URI
OPENID_CONFIG_URL = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration"

# Fetch OpenID configuration from Azure AD
response = requests.get(OPENID_CONFIG_URL)
openid_config = response.json()

# Extract JWKS URI from the OpenID configuration
jwks_uri = openid_config["jwks_uri"]

# Fetch JWKS (public keys)
jwks_response = requests.get(jwks_uri)
jwks = jwks_response.json()

# OAuth2 configuration
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=openid_config["authorization_endpoint"],
    tokenUrl=openid_config["token_endpoint"],
    scopes={"User.Read": "Read user information"}
)

# Function to retrieve the RSA public key from the JWKS
def get_rsa_key(kid):
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return RSAAlgorithm.from_jwk(key)
    raise HTTPException(status_code=401, detail="Invalid token: key not found")

# Token validation function with correct audience validation
async def validate_token(token: str = Security(oauth2_scheme)):
    try:
        # Decode the token header to get the key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = get_rsa_key(unverified_header["kid"])

        # Validate the token with the public RSA key
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=API_AUDIENCE,  # Match against the Application ID URI
            issuer=f"https://sts.windows.net/{AZURE_TENANT_ID}/"  # Ensure the token was issued by your Azure AD tenant
        )
        logger.info(f"Token payload validated successfully")
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
