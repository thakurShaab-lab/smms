import re

FIELD_PATTERNS = {
    # The separator between a label and its value varies a lot across real
    # school documents: "Label: Value", "Label - Value", or (very common in
    # table/form-style layouts once OCR flattens columns onto one line)
    # just "Label Value" with no punctuation at all. `[:\-]?` makes the
    # separator optional so all three read correctly.
    "student_name": [
        r"student\s*name\s*[:\-]?\s*(.+)",
        r"name\s*of\s*student\s*[:\-]?\s*(.+)",
    ],
    "admission_number": [r"admission\s*(?:no\.?|number)\s*[:\-]?\s*([A-Za-z0-9\-\/]+)"],
    "roll_number": [r"roll\s*(?:no\.?|number)\s*[:\-]?\s*([A-Za-z0-9\-\/]+)"],
    "class_name": [r"(?:class|grade)\s*[:\-]?\s*([A-Za-z0-9\s]+?)(?:\n|$|section)"],
    "section_name": [r"section\s*[:\-]?\s*([A-Za-z0-9]+)"],
}


def parse_student_fields(raw_text: str) -> dict:
    normalized = raw_text.replace("\r\n", "\n")
    extracted = {}

    for field, patterns in FIELD_PATTERNS.items():
        value = None
        for pattern in patterns:
            match = re.search(pattern, normalized, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                value = re.sub(r"\s{2,}", " ", value)
                break
        extracted[field] = value or None

    return extracted
