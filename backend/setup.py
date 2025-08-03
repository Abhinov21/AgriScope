from setuptools import setup, find_packages

setup(
    name="agriscope-backend",
    version="1.0.0",
    description="AgriScope Flask Backend for Vegetation Index Analysis",
    packages=find_packages(),
    install_requires=[
        "Flask>=2.3.0,<3.0.0",
        "gunicorn>=20.1.0",
        "flask-cors>=4.0.0",
        "numpy",
        "matplotlib",
        "earthengine-api",
        "requests",
        "python-dotenv"
    ],
    python_requires=">=3.8,<3.14"
)
