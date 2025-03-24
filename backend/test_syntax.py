#!/usr/bin/env python3

import py_compile
import sys

def test_syntax():
    try:
        # Attempt to compile the file
        py_compile.compile('backend/payment.py', doraise=True)
        print("Syntax verification successful: backend/payment.py contains valid Python syntax.")
        return True
    except py_compile.PyCompileError as e:
        print(f"Compilation failed: {str(e)}")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_syntax()
    sys.exit(0 if success else 1) 