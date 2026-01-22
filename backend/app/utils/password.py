from passlib.context import CryptContext

# Create the password context
# - bcrypt is the hashing algorithm (industry standard, secure)
# - deprecated="auto" means old hashes will be auto-upgraded if you change settings later
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Hash a plain text password.
    
    Example:
        hash_password("secret123")
        # Returns: "$2b$12$LQv3c1yqBwe..."
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hash.
    
    Example:
        verify_password("secret123", "$2b$12$LQv3c1yqBwe...")
        # Returns: True or False
    """
    return pwd_context.verify(plain_password, hashed_password)