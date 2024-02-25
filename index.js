const quizContainer=  document.getElementById('quiz');
const submitButton=   document.getElementById('submitBtn');
const loadingButton=  document.getElementById('loadingBtn');
const loadingMessage= document.getElementById('loadingMessage');
const correctAnswersContainer = document.getElementById('correctAnswers');
const apiUrl = 'https://opentdb.com/api.php?amount=3&category=29';

let quizData = [];
let correctAnswers = 0;
let totalAttempts = 0;
let consecutiveCorrectAnswers = 0;


async function fetchQuizData() {
    try {
        loadingButton.classList.remove('hidden');
        loadingMessage.classList.remove('hidden');
        submitButton.disabled = true;

        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.results) {
            quizData = data.results.map(result => ({
                question: result.question,
                options: [...result.incorrect_answers, result.correct_answer],
                answer: result.correct_answer
            }));
            buildQuiz();
        } else {
            console.error('Error fetching quiz data:', data);
        }
    } catch (error) {
        console.error('Error fetching quiz data:', error);
    } finally {
        loadingButton.classList.add('hidden');
        loadingMessage.classList.add('hidden');
        submitButton.disabled = false;
    }
}


function buildQuiz() {
    quizContainer.innerHTML = '';
    quizData.forEach((data, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('mb-4');
        questionDiv.innerHTML = `
            <div class="font-semibold text-xl">${index + 1}. ${decodeEntities(data.question)}</div>
            <div class="ml-4 mt-2 options space-y-2">
                ${data.options.map(option => `
                    <label class="inline-flex items-center">
                        <input type="radio" name="question${index}" value="${option}" class="form-radio h-5 w-5 text-indigo-600">
                        <span class="ml-2 text-lg">${decodeEntities(option)}</span>
                    </label>
                `).join('')}
            </div>
        `;
        quizContainer.appendChild(questionDiv);
    });
}


function showResults() {
    const answerContainers = quizContainer.querySelectorAll('.ml-4');
    let score = 0;
    quizData.forEach((data, index) => {
        const answerContainer = answerContainers[index];
        const selector = `input[name=question${index}]:checked`;
        const userAnswer = (answerContainer.querySelector(selector) || {}).value;
        if (userAnswer === data.answer) {
            score++;
            answerContainer.classList.add('text-green-500');
        } else {
            answerContainer.classList.add('text-red-500');
        }
    });
    correctAnswers = score;
    totalAttempts++;

    if (correctAnswers === 3) {
        consecutiveCorrectAnswers++;
        if (consecutiveCorrectAnswers === 3) {
            fetchQuizData();
        }
    } else {
        consecutiveCorrectAnswers = 0;
        // Show snackbar message
        showSnackbar("Please answer all questions correctly to proceed.");
    }
}


function showSnackbar(message) {
    const snackbar = document.createElement('div');
    snackbar.textContent = message;
    snackbar.classList.add('bg-red-500', 'text-white', 'p-4', 'fixed', 'bottom-0', 'left-0', 'right-0', 'mb-4', 'text-center');
    document.body.appendChild(snackbar);
    setTimeout(() => {
        snackbar.remove();
    }, 3000);
}


function decodeEntities(encodedString) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}


submitButton.addEventListener('click', async () => {
    const checkedOptions = quizContainer.querySelectorAll('input:checked');
    if (checkedOptions.length !== quizData.length) {
        showSnackbar("Please select an answer for each question.");
        return;
    }
    showResults();
    if (correctAnswers !== 3 || totalAttempts < 5) {
        return;
    }
    fetchQuizData();
});

fetchQuizData();
