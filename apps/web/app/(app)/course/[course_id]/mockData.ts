export const MOCK_COURSE_DATA_PYTHON = {
  id: 'python-beginners-course',
  title: 'Python for Beginners',
  description:
    'Learn Python from scratch with interactive lessons, coding exercises, quizzes, and real-world examples. Master variables, loops, functions, OOP, file handling, and more.',
  subject: 'Python Programming',
  chapters: [
    {
      id: 'ch-1',
      title: 'Introduction to Programming',
      topics: [
        {
          id: 't-1-1',
          title: 'What is Programming?',
          content: [
            {
              type: 'h2',
              content:
                'Programming is the process of giving computers step-by-step instructions to perform tasks. Computers cannot think independently, so programmers write precise instructions using programming languages.',
            },
            {
              type: 'info text card',
              content:
                'Imagine programming like writing instructions for a robot. Every tiny step must be clearly explained.',
            },
            {
              type: 'image',
              url: '/images/programming-intro.png',
              caption: 'Programming converts human logic into machine instructions.',
            },
            {
              type: 'code',
              code: 'print("Hello, World!")',
              explanation:
                'This command tells Python to display the text Hello, World! on the screen.',
            },
          ],
          excercise: [
            {
              type: 'mcq',
              question: 'What is programming mainly used for?',
              options: [
                'Cleaning computer hardware',
                'Giving instructions to a computer',
                'Creating internet cables',
                'Installing batteries',
              ],
              answer: 1,
              explanation: 'Programming is used to instruct computers how to perform tasks.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: true,
            },
          ],
        },
        {
          id: 't-1-2',
          title: 'Why Learn Python?',
          content: [
            {
              type: 'h2',
              content:
                'Python is one of the easiest and most popular programming languages in the world. It is used in AI, websites, automation, data science, and game development.',
            },
            {
              type: 'bullets/List points',
              points: [
                'Easy syntax for beginners',
                'Used in Artificial Intelligence',
                'Powers websites and apps',
                'Excellent for automation',
              ],
            },
            {
              type: 'Table',
              headers: ['Field', 'How Python is Used'],
              rows: [
                ['AI', 'Building machine learning systems'],
                ['Web Development', 'Creating backend servers'],
                ['Automation', 'Automating repetitive tasks'],
              ],
            },
            {
              type: 'code',
              code: 'language = "Python"\nprint(language)',
              explanation: 'This creates a variable named language and prints its value.',
            },
          ],
          excercise: [
            {
              type: 'match pair',
              question: 'Match the field with its Python use case.',
              pairs: [
                {
                  left: 'AI',
                  right: 'Machine Learning',
                },
                {
                  left: 'Automation',
                  right: 'Repeating tasks automatically',
                },
                {
                  left: 'Web Development',
                  right: 'Backend applications',
                },
              ],
              explanation: 'Python is flexible and works in many industries.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: true,
            },
          ],
        },
      ],
    },
    {
      id: 'ch-2',
      title: 'Setting Up Python',
      topics: [
        {
          id: 't-2-1',
          title: 'Installing Python',
          content: [
            {
              type: 'h2',
              content:
                'Before writing Python programs, you need to install Python on your computer. Python can be downloaded freely from the official website.',
            },
            {
              type: 'warning text card',
              content: "Always remember to check 'Add Python to PATH' during installation.",
            },
            {
              type: 'image',
              url: '/images/python-installation.png',
              caption: 'Python installation setup screen.',
            },
            {
              type: 'code',
              code: 'python --version',
              explanation: 'This command checks whether Python is installed correctly.',
            },
          ],
          excercise: [
            {
              type: 'fill in the blanks',
              question: 'The command used to check the installed Python version is ______.',
              blankAnswers: ['python --version'],
              explanation: 'The version command verifies that Python is installed properly.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: true,
            },
          ],
        },
        {
          id: 't-2-2',
          title: 'Your First Python Program',
          content: [
            {
              type: 'h2',
              content:
                'The traditional first program in almost every language is Hello World. It helps verify that everything works correctly.',
            },
            {
              type: 'code',
              code: 'print("Hello, World!")',
              explanation: 'The print() function displays output on the screen.',
            },
            {
              type: 'info text card',
              content: 'Functions are reusable commands that perform actions.',
            },
          ],
          excercise: [
            {
              type: 'put in order',
              question: 'Arrange the steps to run a Python file correctly.',
              options: ['Write Python code', 'Save the file', 'Run the program'],
              answer: ['Write Python code', 'Save the file', 'Run the program'],
              explanation: 'Programs must be written and saved before execution.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: true,
            },
          ],
        },
      ],
    },
    {
      id: 'ch-3',
      title: 'Variables and Data Types',
      topics: [
        {
          id: 't-3-1',
          title: 'Understanding Variables',
          content: [
            {
              type: 'h2',
              content: 'Variables are containers used to store information inside computer memory.',
            },
            {
              type: 'image',
              url: '/images/variables-box.png',
              caption: 'Variables act like labeled storage boxes.',
            },
            {
              type: 'code',
              code: 'name = "Alex"\nage = 20\nprint(name)\nprint(age)',
              explanation: 'Variables store values that can later be reused.',
            },
            {
              type: 'error text card',
              content: 'Variable names cannot start with numbers.',
            },
          ],
          excercise: [
            {
              type: 'mcq',
              question: 'Which of these is a valid variable name?',
              options: ['1score', 'player-score', 'player_score', 'player score'],
              answer: 2,
              explanation: 'Underscores are allowed, but spaces and hyphens are not.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: true,
            },
          ],
        },
        {
          id: 't-3-2',
          title: 'Strings, Integers, and Floats',
          content: [
            {
              type: 'h2',
              content: 'Python automatically categorizes values into different data types.',
            },
            {
              type: 'bullets/List points',
              points: [
                'Strings store text',
                'Integers store whole numbers',
                'Floats store decimal numbers',
              ],
            },
            {
              type: 'code',
              code: 'username = "Sarah"\nage = 25\nheight = 5.8',
              explanation: 'Each variable stores a different type of data.',
            },
            {
              type: 'graphs',
              chartType: 'bar',
              label: 'Common Beginner Data Types',
              data: [
                {
                  label: 'Strings',
                  value: 50,
                },
                {
                  label: 'Integers',
                  value: 35,
                },
                {
                  label: 'Floats',
                  value: 15,
                },
              ],
            },
          ],
          excercise: [
            {
              type: 'Short Question analyze with AI',
              question: 'Explain the difference between integers and floats.',
              sampleAnswer: 'Integers are whole numbers while floats contain decimal points.',
              explanation:
                'AI checks whether the learner understands whole numbers versus decimal numbers.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: false,
            },
          ],
        },
      ],
    },
    {
      id: 'ch-4',
      title: 'User Input and Output',
      topics: [
        {
          id: 't-4-1',
          title: 'Getting User Input',
          content: [
            {
              type: 'h2',
              content: 'Programs become interactive when they can receive information from users.',
            },
            {
              type: 'code',
              code: 'name = input("Enter your name: ")\nprint("Hello", name)',
              explanation: 'The input() function waits for the user to type something.',
            },
            {
              type: 'info text card',
              content: 'input() always returns text data unless converted.',
            },
          ],
          excercise: [
            {
              type: 'fill in the blanks',
              question: 'The ______ function is used to collect information from users.',
              blankAnswers: ['input'],
              explanation: 'input() collects data typed by users.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: true,
            },
          ],
        },
      ],
    },
    {
      id: 'ch-5',
      title: 'Operators',
      topics: [
        {
          id: 't-5-1',
          title: 'Arithmetic Operators',
          content: [
            {
              type: 'h2',
              content: 'Arithmetic operators allow programs to perform mathematical calculations.',
            },
            {
              type: 'Table',
              headers: ['Operator', 'Meaning'],
              rows: [
                ['+', 'Addition'],
                ['-', 'Subtraction'],
                ['*', 'Multiplication'],
                ['/', 'Division'],
              ],
            },
            {
              type: 'code',
              code: 'print(5 + 2)\nprint(10 - 3)\nprint(4 * 2)\nprint(8 / 2)',
              explanation: 'Python performs arithmetic calculations using operators.',
            },
          ],
          excercise: [
            {
              type: 'mcq',
              question: 'Which operator is used for multiplication?',
              options: ['+', '-', '*', '/'],
              answer: 2,
              explanation: 'The * symbol represents multiplication.',
            },
          ],
          progress: [
            {
              isCompleted: false,
              isUnlocked: false,
            },
          ],
        },
      ],
    },
  ],
};

export const MY_COURSES_MOCKDATA = [
  MOCK_COURSE_DATA_PYTHON,
  // MOCK_COURSE_DATA_ECONOMICS,
  // MOCK_COURSE_DATA_PRODUCT_MANAGEMENT,
  // SYSTEM_DESIGN_FOR_BEGINNERS_COURSE,
];
