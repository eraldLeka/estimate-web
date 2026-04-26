import json
import os
from typing import Any

SELLER_FILE = "seller_info.json"
DEFAULT_SELLER_NAME = "Erald Leka"
DEFAULT_SELLER = {
    "name": DEFAULT_SELLER_NAME,
    "phone": "",
    "email": "",
    "address": "",
}


def normalize_seller(data: Any) -> dict:
    if not isinstance(data, dict):
        return DEFAULT_SELLER.copy()

    return {
        "name": DEFAULT_SELLER_NAME,
        "phone": str(data.get("phone") or ""),
        "email": str(data.get("email") or ""),
        "address": str(data.get("address") or ""),
    }


def read_seller() -> dict:
    if not os.path.exists(SELLER_FILE):
        return DEFAULT_SELLER.copy()

    try:
        with open(SELLER_FILE, "r", encoding="utf-8") as file:
            return normalize_seller(json.load(file))
    except (OSError, TypeError, ValueError, json.JSONDecodeError):
        return DEFAULT_SELLER.copy()


def write_seller(data: Any) -> dict:
    seller = normalize_seller(data)
    with open(SELLER_FILE, "w", encoding="utf-8") as file:
        json.dump(seller, file, ensure_ascii=False, indent=2)
    return seller
