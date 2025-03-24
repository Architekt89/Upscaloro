#!/usr/bin/env python3

import sys

def fix_syntax():
    try:
        # Read the file
        with open('backend/payment.py', 'r') as f:
            lines = f.readlines()
        
        # Fix only the specific lines we know have issues
        # Line 977
        if 977 <= len(lines):
            if 'except Exception as e:' in lines[976]:
                old_line = lines[976]
                lines[976] = old_line.replace('                    except', '                except')
                print(f"Fixed line 977: {old_line.strip()} -> {lines[976].strip()}")
        
        # Line 1173
        if 1173 <= len(lines):
            if 'except Exception as e:' in lines[1172]:
                old_line = lines[1172]
                lines[1172] = old_line.replace('                    except', '                except')
                print(f"Fixed line 1173: {old_line.strip()} -> {lines[1172].strip()}")
        
        # Write the fixed file
        with open('backend/payment_fixed.py', 'w') as f:
            f.writelines(lines)
        
        print("Fixed file written to backend/payment_fixed.py")
        
        # Test if the fixed file has valid syntax
        try:
            import ast
            ast.parse(open('backend/payment_fixed.py').read())
            print("Syntax check passed!")
            # If successful, overwrite the original file
            with open('backend/payment.py', 'w') as f:
                f.writelines(lines)
            print("Original file updated successfully.")
            return True
        except SyntaxError as e:
            print(f"Syntax error still exists: {str(e)}")
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = fix_syntax()
    sys.exit(0 if success else 1) 