class AudioController {
  constructor(bgMusicPath) {
    this.bgMusic = new Audio(bgMusicPath);
    this.flipSound = new Audio('Music/flip.wav');
    this.matchSound = new Audio('Music/match.wav');
    this.victorySound = new Audio('Music/victory.mp3');
    this.gameOverSound = new Audio('Music/gameOver.wav');
    this.bgMusic.volume = 0.2;
    this.bgMusic.loop = true;
  }
  toggleMute() {
    this.bgMusic.muted = !this.bgMusic.muted;
  }
  startMusic() {
    this.bgMusic.play();
  }
  stopMusic() {
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }
  flip() {
    this.flipSound.play();
  }
  match() {
    this.matchSound.play();
  }
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  gameOver() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}

class MixOrMatch {
  constructor(totalTime, cards, bgMusicPath) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timeRemaining = totalTime;
    this.timer = document.getElementById('time-remaining');
    this.ticker = document.getElementById('total-cards-found');
    this.audioController = new AudioController(bgMusicPath);
  }

  startGame() {
    this.cardToCheck = null;
    this.totalClicks = 0;
    this.timeRemaining = this.totalTime;
    this.matchedCards = [];
    this.busy = true;
    this.shuffleCards();
    setTimeout(() => {
      this.audioController.startMusic();
      this.shuffleCards();
      this.countDown = this.startCountDown();
      this.busy = false;
    }, 500);
    this.hideCards();
    this.timer.innerText = this.timeRemaining;
    this.ticker.innerText = this.totalClicks;
  }

  hideCards() {
    this.cardsArray.forEach(card => {
      card.classList.remove('visible');
      card.classList.remove('matched');
    });
  }

  flipCard(card) {
    if (this.canFlipCard(card)) {
      this.audioController.flip();
      //this.totalClicks++;
      //this.ticker.innerText = this.totalClicks;
      card.classList.add('visible');

      if (this.cardToCheck) {
        this.checkForCardMatch(card)
      } else {
        this.cardToCheck = card;
      }
    }
  }

  checkForCardMatch(card) {
    if (this.getCardType(card) === this.getCardType(this.cardToCheck)) {
      //this.cardMatch(card,this.cardToCheck);
      this.totalClicks++;
      this.ticker.innerText = this.totalClicks;
      this.cardMatch(card, this.cardToCheck);
    }
    else {
      this.cardMisMatch(card, this.cardToCheck);
    }

    this.cardToCheck = null;
  }

  cardMatch(card1, card2) {
    this.matchedCards.push(card1);
    this.matchedCards.push(card2);
    card1.classList.add('matched');
    card2.classList.add('matched');
    this.audioController.match();
    if (this.matchedCards.length === this.cardsArray.length)
      this.victory();
  }

  cardMisMatch(card1, card2) {
    this.busy = true;
    setTimeout(() => {
      card1.classList.remove('visible');
      card2.classList.remove('visible');
      this.busy = false;
    }, 1000);
  }

  getCardType(card) {
    return card.getElementsByClassName('card-value')[0].src;
  }

  startCountDown() {
    return setInterval(() => {
      this.timeRemaining--;
      this.timer.innerText = this.timeRemaining;
      if (this.timeRemaining === 0) {
        this.gameOver();
      }
    }, 1000)
  }

  gameOver() {
    clearInterval(this.countDown);
    this.audioController.gameOver();
    document.getElementById('game-over-text').classList.add('visible');
  }

  victory() {
    clearInterval(this.countDown);
    this.audioController.victory();
    document.getElementById('victory-text').classList.add('visible');
  }

  shuffleCards() {
    for (let i = this.cardsArray.length - 1; i > 0; i--) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      this.cardsArray[randIndex].style.order = i;
      this.cardsArray[i].style.order = randIndex;
    }
  }

  canFlipCard(card) {
    return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
  }

}

const imageSets = {
  cars: {
    images: [
    "toyota.png",
    "mercedes.png",
    "renault.jpg",
    "audi.png",
    "skoda.png",
    "honda.jpg",
    "ferrari.jpg",
    "ford.png",
    "citroen.png",
    "fiat.jpg",
    "bmw.jpg",
    "chevrolet.png"
  ],
  music: "Music/blue_ice.mp3"
},
  games: {
    images: [
    "hogwarts.jpg",
    "repo.jpg",
    "planet_coaster.jpg",
    "warframe.png",
    "fortnite.jpg",
    "stray.jpg",
    "silksong.jpg",
    "jedi.jpg",
    "warcraft.png",
    "bronze.jpg",
    "copycat.jpg",
    "sims.jpg"
    ],
    music: "Music/Raingame.mp3"
  }
};

// detect category from html
const category = document.body.dataset.category;
const cardImages = imageSets[category].images;
const bgMusicPath = imageSets[category].music;

// Generate Cards
let cards = [...cardImages, ...cardImages];
cards = cards.sort(() => Math.random() - 0.5);

const cardsContainer = document.getElementById("cards");
cards.forEach(image => { 
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = ` 
    <div class="card-back card-face"> 
      <img class="cards-background-back-page" src="../Images/back.jpg">
    </div> <div class="card-front card-face"> 
      <img class="card-value" src="../Images/${image}">
    </div> `;
  cardsContainer.appendChild(card); 
});

function ready() {
  let overlays = Array.from(document.getElementsByClassName('overlay-text'));
  let cards = Array.from(document.getElementsByClassName('card'));
  let game = new MixOrMatch(200, cards, bgMusicPath);

  // MUTE BUTTON 
  const muteBtn = document.getElementById("mute-btn");
  muteBtn.addEventListener("click", () => {
    game.audioController.toggleMute();
    muteBtn.textContent = game.audioController.bgMusic.muted ? "Unmute 🔊" : "Mute 🔇";
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', () => {
      overlay.classList.remove('visible');
      game.startGame();
    });
  });
  cards.forEach(card => {
    card.addEventListener('click', () => {
      game.flipCard(card);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready());
} else {
  ready();
}

