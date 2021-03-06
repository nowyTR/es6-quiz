export class utils {
  static displayTime (seconds, container) {
    const minutesLeft = Math.floor(seconds / 60)
    const secondsLeft = seconds % 60
    container.innerHTML = `<div class="sg-badge sg-badge--rounded">
                               <div class="sg-text sg-text--emphasised quiz-timer__time">
                                  ${minutesLeft}
                                  :
                                  ${secondsLeft < 10 ? '0' : ''}
                                  ${secondsLeft}
                               </div>
                           </div>`
  }

  static disableElement (element) {
    element.classList.add('sg-button-primary--disabled')
    element.setAttribute('disabled', '')
  }

  static activateElement (element) {
    element.classList.remove('sg-button-primary--disabled')
    element.removeAttribute('disabled')
  }
}
