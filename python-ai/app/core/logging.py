import logging
import sys


def configure_logging(environment: str) -> None:
    level = logging.INFO if environment.lower() == "production" else logging.DEBUG

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", "%Y-%m-%d %H:%M:%S")
    )

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.handlers = [handler]

    logging.getLogger("uvicorn.access").setLevel(level)
