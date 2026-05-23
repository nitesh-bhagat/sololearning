export const MOCK_COURSE_DATA = {
  id: 'python-beginners-course',
  title: 'Python for Beginners',
  description:
    'Learn Python from scratch with interactive lessons, coding exercises, quizzes, and real-world examples. Master variables, loops, functions, OOP, file handling, and more.',
  chapters: [
    {
      id: 'ch-1',
      title: 'Introduction to Python',
      topics: [
        {
          id: 't-1-1',
          title: 'What is Python?',
          content: {
            h1: 'What is Python?',
            p: 'Python is a beginner-friendly programming language used in web development, AI, automation, data science, and more.',
            info: 'Python focuses on readability and simple syntax.',
            code: 'print("Welcome to Python!")',
            solution: 'print("Welcome to Python!")',
          },
          progress: [{ isCompleted: true, isUnlocked: true }],
        },
        {
          id: 't-1-2',
          title: 'Installing Python',
          content: {
            h1: 'Installing Python',
            p: 'Download and install Python from the official Python website.',
            info: 'Use python --version to verify installation.',
            code: 'python --version',
            solution: 'Python 3.x.x',
          },
          progress: [{ isCompleted: false, isUnlocked: true }],
        },
        {
          id: 't-1-3',
          title: 'Your First Program',
          content: {
            h1: 'Your First Program',
            p: 'Let’s create your first Python program.',
            info: 'The print() function displays output.',
            code: 'print("Hello, World!")',
            solution: 'Hello, World!',
          },
          progress: [{ isCompleted: false, isUnlocked: true }],
        },
        {
          id: 't-1-4',
          title: 'Comments in Python',
          content: {
            h1: 'Comments in Python',
            p: 'Comments are used to explain code.',
            info: 'Single-line comments start with #.',
            code: '# This is a comment\nprint("Python")',
            solution: 'Python',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-2',
      title: 'Variables & Data Types',
      topics: [
        {
          id: 't-2-1',
          title: 'Variables',
          content: {
            h1: 'Variables',
            p: 'Variables store data values.',
            info: 'You can assign values using = operator.',
            code: 'name = "John"\nage = 25\nprint(name)',
            solution: 'John',
          },
          progress: [],
        },
        {
          id: 't-2-2',
          title: 'Strings',
          content: {
            h1: 'Strings',
            p: 'Strings represent text data.',
            info: 'Strings can use single or double quotes.',
            code: 'message = "Hello"\nprint(message)',
            solution: 'Hello',
          },
          progress: [],
        },
        {
          id: 't-2-3',
          title: 'Numbers',
          content: {
            h1: 'Numbers',
            p: 'Python supports integers and floating-point numbers.',
            info: 'Integers are whole numbers.',
            code: 'x = 10\ny = 3.5\nprint(x + y)',
            solution: '13.5',
          },
          progress: [],
        },
        {
          id: 't-2-4',
          title: 'Booleans',
          content: {
            h1: 'Booleans',
            p: 'Boolean values are True or False.',
            info: 'Used heavily in conditions.',
            code: 'is_active = True\nprint(is_active)',
            solution: 'True',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-3',
      title: 'Operators & Expressions',
      topics: [
        {
          id: 't-3-1',
          title: 'Arithmetic Operators',
          content: {
            h1: 'Arithmetic Operators',
            p: 'Arithmetic operators perform mathematical calculations.',
            info: 'Operators include +, -, *, /, %.',
            code: 'print(10 + 5)\nprint(10 % 3)',
            solution: '15\n1',
          },
          progress: [],
        },
        {
          id: 't-3-2',
          title: 'Comparison Operators',
          content: {
            h1: 'Comparison Operators',
            p: 'Comparison operators compare values.',
            info: 'They return True or False.',
            code: 'print(5 > 3)\nprint(5 == 2)',
            solution: 'True\nFalse',
          },
          progress: [],
        },
        {
          id: 't-3-3',
          title: 'Logical Operators',
          content: {
            h1: 'Logical Operators',
            p: 'Logical operators combine conditions.',
            info: 'Operators are and, or, not.',
            code: 'print(True and False)',
            solution: 'False',
          },
          progress: [],
        },
        {
          id: 't-3-4',
          title: 'Assignment Operators',
          content: {
            h1: 'Assignment Operators',
            p: 'Assignment operators assign values.',
            info: '+= adds and assigns.',
            code: 'x = 5\nx += 2\nprint(x)',
            solution: '7',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-4',
      title: 'Control Flow',
      topics: [
        {
          id: 't-4-1',
          title: 'If Statements',
          content: {
            h1: 'If Statements',
            p: 'If statements run code conditionally.',
            info: 'Indentation is important in Python.',
            code: 'age = 18\nif age >= 18:\n    print("Adult")',
            solution: 'Adult',
          },
          progress: [],
        },
        {
          id: 't-4-2',
          title: 'Else and Elif',
          content: {
            h1: 'Else and Elif',
            p: 'Use else and elif for multiple conditions.',
            info: 'elif means else if.',
            code: 'score = 80\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")',
            solution: 'B',
          },
          progress: [],
        },
        {
          id: 't-4-3',
          title: 'For Loops',
          content: {
            h1: 'For Loops',
            p: 'For loops repeat code over sequences.',
            info: 'range() generates numbers.',
            code: 'for i in range(3):\n    print(i)',
            solution: '0\n1\n2',
          },
          progress: [],
        },
        {
          id: 't-4-4',
          title: 'While Loops',
          content: {
            h1: 'While Loops',
            p: 'While loops run until a condition becomes false.',
            info: 'Be careful of infinite loops.',
            code: 'count = 1\nwhile count <= 3:\n    print(count)\n    count += 1',
            solution: '1\n2\n3',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-5',
      title: 'Functions',
      topics: [
        {
          id: 't-5-1',
          title: 'Creating Functions',
          content: {
            h1: 'Creating Functions',
            p: 'Functions help organize reusable code.',
            info: 'Functions are defined using def.',
            code: 'def greet():\n    print("Hello")\n\ngreet()',
            solution: 'Hello',
          },
          progress: [],
        },
        {
          id: 't-5-2',
          title: 'Function Parameters',
          content: {
            h1: 'Function Parameters',
            p: 'Functions can accept input values.',
            info: 'Parameters make functions reusable.',
            code: 'def greet(name):\n    print("Hello", name)\n\ngreet("John")',
            solution: 'Hello John',
          },
          progress: [],
        },
        {
          id: 't-5-3',
          title: 'Return Values',
          content: {
            h1: 'Return Values',
            p: 'Functions can return results.',
            info: 'Use return keyword.',
            code: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))',
            solution: '5',
          },
          progress: [],
        },
        {
          id: 't-5-4',
          title: 'Lambda Functions',
          content: {
            h1: 'Lambda Functions',
            p: 'Lambda functions are small anonymous functions.',
            info: 'Useful for quick operations.',
            code: 'square = lambda x: x * x\nprint(square(4))',
            solution: '16',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-6',
      title: 'Data Structures',
      topics: [
        {
          id: 't-6-1',
          title: 'Lists',
          content: {
            h1: 'Lists',
            p: 'Lists store multiple items.',
            info: 'Lists are mutable.',
            code: 'fruits = ["apple", "banana"]\nprint(fruits[0])',
            solution: 'apple',
          },
          progress: [],
        },
        {
          id: 't-6-2',
          title: 'Tuples',
          content: {
            h1: 'Tuples',
            p: 'Tuples are immutable collections.',
            info: 'Tuples use parentheses.',
            code: 'point = (10, 20)\nprint(point[1])',
            solution: '20',
          },
          progress: [],
        },
        {
          id: 't-6-3',
          title: 'Dictionaries',
          content: {
            h1: 'Dictionaries',
            p: 'Dictionaries store key-value pairs.',
            info: 'Keys must be unique.',
            code: 'user = {"name": "John"}\nprint(user["name"])',
            solution: 'John',
          },
          progress: [],
        },
        {
          id: 't-6-4',
          title: 'Sets',
          content: {
            h1: 'Sets',
            p: 'Sets store unique values.',
            info: 'Duplicates are automatically removed.',
            code: 'nums = {1, 2, 2, 3}\nprint(nums)',
            solution: '{1, 2, 3}',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-7',
      title: 'Object Oriented Programming',
      topics: [
        {
          id: 't-7-1',
          title: 'Classes and Objects',
          content: {
            h1: 'Classes and Objects',
            p: 'Classes are blueprints for objects.',
            info: 'Objects are instances of classes.',
            code: 'class Car:\n    def __init__(self, name):\n        self.name = name\n\ncar = Car("BMW")\nprint(car.name)',
            solution: 'BMW',
          },
          progress: [],
        },
        {
          id: 't-7-2',
          title: 'Inheritance',
          content: {
            h1: 'Inheritance',
            p: 'Inheritance allows code reuse.',
            info: 'Child classes inherit parent features.',
            code: 'class Animal:\n    def speak(self):\n        print("Sound")\n\nclass Dog(Animal):\n    pass\n\nDog().speak()',
            solution: 'Sound',
          },
          progress: [],
        },
        {
          id: 't-7-3',
          title: 'Polymorphism',
          content: {
            h1: 'Polymorphism',
            p: 'Different classes can use same method names.',
            info: 'Polymorphism increases flexibility.',
            code: 'class Cat:\n    def sound(self):\n        print("Meow")\n\nclass Dog:\n    def sound(self):\n        print("Bark")',
            solution: 'Meow / Bark',
          },
          progress: [],
        },
        {
          id: 't-7-4',
          title: 'Encapsulation',
          content: {
            h1: 'Encapsulation',
            p: 'Encapsulation hides internal details.',
            info: 'Private variables use __ prefix.',
            code: 'class Bank:\n    def __init__(self):\n        self.__balance = 1000',
            solution: 'Private variable created',
          },
          progress: [],
        },
      ],
    },

    {
      id: 'ch-8',
      title: 'Advanced Python Basics',
      topics: [
        {
          id: 't-8-1',
          title: 'File Handling',
          content: {
            h1: 'File Handling',
            p: 'Python can read and write files.',
            info: 'Use open() to work with files.',
            code: 'file = open("test.txt", "w")\nfile.write("Hello")\nfile.close()',
            solution: 'File written successfully',
          },
          progress: [],
        },
        {
          id: 't-8-2',
          title: 'Exception Handling',
          content: {
            h1: 'Exception Handling',
            p: 'Exceptions prevent program crashes.',
            info: 'Use try and except.',
            code: 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")',
            solution: 'Cannot divide by zero',
          },
          progress: [],
        },
        {
          id: 't-8-3',
          title: 'Modules',
          content: {
            h1: 'Modules',
            p: 'Modules help organize Python code.',
            info: 'Import modules using import keyword.',
            code: 'import math\nprint(math.sqrt(16))',
            solution: '4.0',
          },
          progress: [],
        },
        {
          id: 't-8-4',
          title: 'Virtual Environments',
          content: {
            h1: 'Virtual Environments',
            p: 'Virtual environments isolate project dependencies.',
            info: 'Use venv for creating environments.',
            code: 'python -m venv env',
            solution: 'Virtual environment created',
          },
          progress: [],
        },
      ],
    },
  ],
};
