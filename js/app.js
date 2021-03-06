import ES6Promise from 'es6-promise'
import fetch from 'isomorphic-fetch'
import { apiUrl } from './config'
import { utils } from './utils'

(function app () {
  const actionButton = document.querySelector('.quiz-btn')
  const questionsField = document.querySelector('.quiz-questions')
  const quizTimer = document.querySelector('.quiz-timer')
  const quizResults = document.querySelector('.quiz-results')
  let countdown

  // Toggle off disabled state on the button after user checks answer
  questionsField.addEventListener('click', function (e) {
    let matches = e.target.matches ? e.target.matches('.quiz-questions__answer') : e.target.msMatchesSelector('.quiz-questions__answer')
    if (matches) {
      utils.activateElement(actionButton)
    }
  }, false)

  class Quiz {
    constructor (dataUrl, userPoints = 0, currentQuestion = 0, correctAnswer = 0, timer = 0, questions = []) {
      this.dataUrl = dataUrl
      this._userPoints = userPoints
      this.currentQuestion = currentQuestion
      this.correctAnswer = correctAnswer
      this.timer = timer
      this.questions = questions
    }

    getData () {
      ES6Promise.polyfill()
      const processData = (data) => {
        this.timer = data.time_seconds
        this.questions = data.questions
      }
      return fetch(this.dataUrl)
        .then(response => response.json())
        .then(data => processData(data))
        .catch(error => console.log('Something went wrong', error))
    }

    start () {
      actionButton.onclick = () => this.processAnswer()
      actionButton.innerHTML = 'Next'
      utils.disableElement(actionButton)

      this.displayTimer(this.timer)
      this.updateQuestion(this.questions[0])
    }

    displayTimer (seconds) {
      clearInterval(countdown)

      const presentTime = Date.now()
      const finishTime = presentTime + seconds * 1000

      utils.displayTime(seconds, quizTimer)

      countdown = setInterval(() => {
        const secondsLeft = Math.round((finishTime - Date.now()) / 1000)

        if (secondsLeft < 0) {
          clearInterval(countdown)
          this.showResult()
        }

        utils.displayTime(secondsLeft, quizTimer)
      }, 1000)
    }

    loadAnswers (answers) {
      return answers.map((answer) => {
        if (answer.correct) {
          this.updateCorrectAnswer(answer.id)
        }

        return `<div class="sg-label sg-label--secondary">
                    <div class="sg-label__icon">
                        <div class="sg-radio">
                            <input class="sg-radio__element quiz-questions__answer" type="radio" id="${answer.id}" name="answer">
                            <label class="sg-radio__ghost" for="${answer.id}"></label>
                        </div>
                    </div>
                    <label class="sg-label__text" for="${answer.id}">${answer.answer}</label>
                </div>`
      })
    }

    processAnswer () {
      if (this.currentQuestion < this.questions.length) {
        const answer = parseInt(document.querySelector('input[name=answer]:checked').getAttribute('id'))

        if (answer === this.correctAnswer) {
          this.addPoint()
        }

        this.updateQuestion(this.questions[this.currentQuestion])
      } else {
        this.showResult()
      }
    }

    updateCorrectAnswer (id) {
      this.correctAnswer = id
    }

    addPoint () {
      this._userPoints += 1
    }

    updateQuestion (question) {
      questionsField.innerHTML = `<h3 class="quiz-questions__title">${question.question}</h3>
                                  <form class="quiz-questions__form">
                                      ${this.loadAnswers(question.answers).join('')}    
                                  </form>`
      this.currentQuestion += 1
      utils.disableElement(actionButton)
    }

    showResult () {
      questionsField.style.display = 'none'
      quizTimer.style.display = 'none'

      actionButton.innerHTML = 'Try Again'
      actionButton.onclick = () => this.reset()
      utils.activateElement(actionButton)

      quizResults.innerHTML = `<div class="sg-flash">
                                 <div class="sg-flash__message">
                                   <div class="sg-text sg-text--emphasised sg-text--standout sg-text--light">
                                     Correct answers: 
                                                      <div class="sg-badge sg-badge--large sg-badge--blue-secondary-light">
                                                        <div class="sg-text sg-text--emphasised sg-text--standout sg-text--blue"> ${this._userPoints} / ${this.questions.length}</div>
                                                      </div>
                                   </div>
                                 </div>
                               </div>`
      quizResults.style.display = 'block'
    }

    reset () {
      this._userPoints = 0
      this.currentQuestion = 0
      this.correctAnswer = 0
      questionsField.style.display = 'block'
      quizTimer.style.display = 'block'
      quizResults.style.display = 'none'
      this.start()
    }
  }

  const brainlyQuiz = new Quiz(apiUrl)
  brainlyQuiz.getData()
  actionButton.onclick = () => brainlyQuiz.start()
}())
