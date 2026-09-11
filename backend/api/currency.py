from fastapi import APIRouter
from backend.services.currency_service import get_exchange_rates, SUPPORTED_CURRENCIES

router = APIRouter(prefix="/currency", tags=["Currency"])

@router.get("/rates")
def fetch_rates():
    """
    Returns live or cached currency exchange rates against base USD.
    """
    return get_exchange_rates()

@router.get("/supported")
def fetch_supported_currencies():
    """
    Returns list of supported currency descriptors with symbols.
    """
    return SUPPORTED_CURRENCIES
