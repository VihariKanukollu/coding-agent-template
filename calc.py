#!/usr/bin/env python3
"""
Advanced Calculator with support for:
- Basic operations: +, -, *, /, %, **
- Advanced functions: sin, cos, tan, log, sqrt, etc.
- Expression evaluation
- Memory functions
- History tracking
"""

import math
import re
from typing import Union, List


class AdvancedCalculator:
    def __init__(self):
        self.memory = 0
        self.history: List[str] = []
        self.ans = 0

    def add(self, a: float, b: float) -> float:
        """Addition"""
        return a + b

    def subtract(self, a: float, b: float) -> float:
        """Subtraction"""
        return a - b

    def multiply(self, a: float, b: float) -> float:
        """Multiplication"""
        return a * b

    def divide(self, a: float, b: float) -> float:
        """Division"""
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    def power(self, a: float, b: float) -> float:
        """Exponentiation"""
        return a ** b

    def modulo(self, a: float, b: float) -> float:
        """Modulo operation"""
        return a % b

    def sqrt(self, a: float) -> float:
        """Square root"""
        if a < 0:
            raise ValueError("Cannot calculate square root of negative number")
        return math.sqrt(a)

    def factorial(self, n: int) -> int:
        """Factorial"""
        if n < 0:
            raise ValueError("Factorial not defined for negative numbers")
        return math.factorial(int(n))

    def sin(self, angle: float, degrees: bool = False) -> float:
        """Sine function"""
        if degrees:
            angle = math.radians(angle)
        return math.sin(angle)

    def cos(self, angle: float, degrees: bool = False) -> float:
        """Cosine function"""
        if degrees:
            angle = math.radians(angle)
        return math.cos(angle)

    def tan(self, angle: float, degrees: bool = False) -> float:
        """Tangent function"""
        if degrees:
            angle = math.radians(angle)
        return math.tan(angle)

    def log(self, a: float, base: float = 10) -> float:
        """Logarithm"""
        if a <= 0:
            raise ValueError("Logarithm undefined for non-positive numbers")
        return math.log(a, base)

    def ln(self, a: float) -> float:
        """Natural logarithm"""
        if a <= 0:
            raise ValueError("Natural logarithm undefined for non-positive numbers")
        return math.log(a)

    def abs(self, a: float) -> float:
        """Absolute value"""
        return abs(a)

    def ceil(self, a: float) -> int:
        """Ceiling function"""
        return math.ceil(a)

    def floor(self, a: float) -> int:
        """Floor function"""
        return math.floor(a)

    # Memory functions
    def memory_store(self, value: float):
        """Store value in memory"""
        self.memory = value

    def memory_recall(self) -> float:
        """Recall value from memory"""
        return self.memory

    def memory_clear(self):
        """Clear memory"""
        self.memory = 0

    def memory_add(self, value: float):
        """Add value to memory"""
        self.memory += value

    def memory_subtract(self, value: float):
        """Subtract value from memory"""
        self.memory -= value

    def evaluate(self, expression: str) -> float:
        """
        Evaluate a mathematical expression
        Supports: +, -, *, /, **, %, parentheses, and math functions
        """
        # Replace common math functions and constants
        expression = expression.replace('^', '**')
        expression = expression.replace('π', str(math.pi))
        expression = expression.replace('pi', str(math.pi))
        expression = expression.replace('e', str(math.e))
        expression = expression.replace('ans', str(self.ans))

        # Create safe namespace for eval
        safe_dict = {
            'sqrt': math.sqrt,
            'sin': math.sin,
            'cos': math.cos,
            'tan': math.tan,
            'log': math.log10,
            'ln': math.log,
            'abs': abs,
            'ceil': math.ceil,
            'floor': math.floor,
            'exp': math.exp,
            'factorial': math.factorial,
            'radians': math.radians,
            'degrees': math.degrees,
            '__builtins__': {}
        }

        try:
            result = eval(expression, safe_dict)
            self.ans = result
            self.history.append(f"{expression} = {result}")
            return result
        except Exception as e:
            raise ValueError(f"Invalid expression: {e}")

    def show_history(self, n: int = 10) -> List[str]:
        """Show last n calculations"""
        return self.history[-n:]

    def clear_history(self):
        """Clear calculation history"""
        self.history.clear()


def print_menu():
    """Print calculator menu"""
    print("\n" + "="*50)
    print("ADVANCED CALCULATOR")
    print("="*50)
    print("1. Basic Operations (+, -, *, /, %, **)")
    print("2. Advanced Functions (sqrt, sin, cos, tan, log, ln)")
    print("3. Expression Evaluation")
    print("4. Memory Functions (MS, MR, MC, M+, M-)")
    print("5. Show History")
    print("6. Clear History")
    print("7. Help")
    print("8. Exit")
    print("="*50)


def print_help():
    """Print help information"""
    print("\n" + "="*50)
    print("CALCULATOR HELP")
    print("="*50)
    print("\nExpression Evaluation Examples:")
    print("  2 + 3 * 4")
    print("  sqrt(16) + 5")
    print("  sin(30) * cos(45)")
    print("  log(100) + ln(e)")
    print("  2**3 + sqrt(25)")
    print("  (5 + 3) * 2 - 10 / 2")
    print("\nSpecial values:")
    print("  pi or π - Pi constant")
    print("  e - Euler's number")
    print("  ans - Last result")
    print("\nFunctions available:")
    print("  sqrt(x) - Square root")
    print("  sin(x), cos(x), tan(x) - Trig functions (radians)")
    print("  log(x) - Log base 10")
    print("  ln(x) - Natural log")
    print("  abs(x) - Absolute value")
    print("  ceil(x), floor(x) - Ceiling/Floor")
    print("  factorial(x) - Factorial")
    print("="*50)


def main():
    """Main calculator interface"""
    calc = AdvancedCalculator()

    print("Welcome to Advanced Calculator!")
    print("Type 'menu' to see options or 'help' for assistance")
    print("Or simply enter an expression to evaluate (e.g., '2 + 3 * 4')")

    while True:
        try:
            user_input = input("\nCalc> ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['exit', 'quit', 'q']:
                print("Goodbye!")
                break

            elif user_input.lower() == 'menu':
                print_menu()

            elif user_input.lower() == 'help':
                print_help()

            elif user_input.lower() == 'history':
                history = calc.show_history()
                if history:
                    print("\nCalculation History:")
                    for entry in history:
                        print(f"  {entry}")
                else:
                    print("No history yet")

            elif user_input.lower() == 'clear history':
                calc.clear_history()
                print("History cleared")

            elif user_input.lower().startswith('ms '):
                value = float(user_input[3:])
                calc.memory_store(value)
                print(f"Stored {value} in memory")

            elif user_input.lower() == 'mr':
                print(f"Memory: {calc.memory_recall()}")

            elif user_input.lower() == 'mc':
                calc.memory_clear()
                print("Memory cleared")

            elif user_input.lower().startswith('m+ '):
                value = float(user_input[3:])
                calc.memory_add(value)
                print(f"Added {value} to memory. Memory: {calc.memory}")

            elif user_input.lower().startswith('m- '):
                value = float(user_input[3:])
                calc.memory_subtract(value)
                print(f"Subtracted {value} from memory. Memory: {calc.memory}")

            else:
                # Try to evaluate as expression
                result = calc.evaluate(user_input)
                print(f"= {result}")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()