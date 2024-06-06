const J = 10;
const Q = 10;
const K = 10;
const A = 11;

function createDeck() {
    let deck = [];
    const suits = ['H', 'D', 'C', 'S'];
    const cardValues = {
        2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
        J: J, Q: Q, K: K, A: A
    };

    suits.forEach(suit => {
        for (let value in cardValues) {
            deck.push({ value: cardValues[value], img: `cards/${value}-${suit}.png` });
        }
    });

    return deck;
}

function shuffle(deck) {
    for (let i = 0; i < deck.length; i++) {
        let randomIndex = Math.floor(Math.random() * deck.length);
        [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
    }
    return deck;
}

let deck;
let playerHand;
let dealerHand;
let playerScore;
let dealerScore;
let playerBalance = 100; // Starting balance
let currentBet = 1; // Default bet amount

document.getElementById('newgame').addEventListener('click', startGame);
document.getElementById('hit').addEventListener('click', playerHit);
document.getElementById('stand').addEventListener('click', playerStand);
document.getElementById('placeBet').addEventListener('click', placeBet);

function placeBet() {
    let betAmount = parseInt(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
    } else if (betAmount > playerBalance) {
        alert("You don't have enough balance to place this bet.");
    } else {
        currentBet = betAmount;
        alert("Bet placed: $" + currentBet);
    }
}

function startGame() {
    deck = shuffle(createDeck());
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);

    // Update UI for a new game
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('dealer-score').textContent = dealerHand[0].value;

    updateUI();
    updateScoreboard();
}

function playerHit() {
    playerHand.push(deck.pop());
    playerScore = calculateScore(playerHand);

    updateUI();
    updateScoreboard();
    checkPlayerBust();
}

function playerStand() {
    while (dealerScore < 17) {
        dealerHand.push(deck.pop());
        dealerScore = calculateScore(dealerHand);
    }

    updateUI(true);
    updateScoreboard(true);
    determineWinner();
}

function calculateScore(hand) {
    let score = hand.reduce((total, card) => total + card.value, 0);
    let aceCount = hand.filter(card => card.value === A).length;

    // Adjust for aces
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

function updateUI(showDealerSecondCard = false) {
    document.getElementById('playercard1').src = playerHand[0].img;
    document.getElementById('playercard2').src = playerHand[1].img;
    document.getElementById('playercard3').classList.add('hidden');
    document.getElementById('playercard4').classList.add('hidden');
    document.getElementById('playercard5').classList.add('hidden');
    document.getElementById('playercard6').classList.add('hidden');
    document.getElementById('playercard7').classList.add('hidden');
    document.getElementById('playercard8').classList.add('hidden');

    for (let i = 2; i < playerHand.length; i++) {
        let cardElem = document.getElementById(`playercard${i + 1}`);
        cardElem.src = playerHand[i].img;
        cardElem.classList.remove('hidden');
    }

    document.getElementById('dealercard1').src = dealerHand[0].img;
    if (showDealerSecondCard) {
        document.getElementById('dealercard2').src = dealerHand[1].img;
    } else {
        document.getElementById('dealercard2').src = 'cardbg.jpg';
    }
    document.getElementById('dealercard3').classList.add('hidden');
    document.getElementById('dealercard4').classList.add('hidden');
    document.getElementById('dealercard5').classList.add('hidden');
    document.getElementById('dealercard6').classList.add('hidden');
    document.getElementById('dealercard7').classList.add('hidden');
    document.getElementById('dealercard8').classList.add('hidden');

    for (let i = 2; i < dealerHand.length; i++) {
        let cardElem = document.getElementById(`dealercard${i + 1}`);
        cardElem.src = dealerHand[i].img;
        cardElem.classList.remove('hidden');
    }
}

function updateScoreboard(showDealerSecondCard = false) {
    document.getElementById('player-score').textContent = playerScore;
    if (showDealerSecondCard) {
        document.getElementById('dealer-score').textContent = dealerScore;
    } else {
        document.getElementById('dealer-score').textContent = dealerHand[0].value;
    }
    document.getElementById('playerBalance').textContent = playerBalance;
}

function checkPlayerBust() {
    if (playerScore > 21) {
        showDealerHand();
        alert("You bust! Dealer wins.");
        playerBalance -= currentBet;
        updateScoreboard();
        resetGame();
    }
}

function determineWinner() {
    // Show all the dealer's cards
    updateUI(true);

    let resultMessage = "";
    if (dealerScore > 21 || playerScore > dealerScore) {
        resultMessage = "You win!";
        playerBalance += currentBet;
    } else if (dealerScore > playerScore) {
        resultMessage = `Dealer wins! Dealer had: ${dealerHand.map(card => card.value).join(', ')}`;
        playerBalance -= currentBet;
    } else {
        resultMessage = "It's a tie!";
    }

    // Reset the game after the alert is closed
    setTimeout(function() {
        // Display the result message using an alert box
        alert(resultMessage);

        // Update the player balance
        updateScoreboard();

        // Reset the game
        resetGame();
    }, 500); // Adjust the delay time as needed (in milliseconds)
}

function showDealerHand() {
    updateUI(true);
}

function resetGame() {
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    document.querySelectorAll('.cards').forEach(card => {
        card.src = 'cardbg.jpg';
        card.classList.add('hidden');
    });
    document.getElementById('playercard1').classList.remove('hidden');
    document.getElementById('playercard2').classList.remove('hidden');
    document.getElementById('dealercard1').classList.remove('hidden');
    document.getElementById('dealercard2').classList.remove('hidden');
    document.getElementById('player-score').textContent = 0;
    document.getElementById('dealer-score').textContent = 0;
    updateScoreboard();

    // Ensure the dealer's second card is always shown
    document.getElementById('dealercard2').src = 'cardbg.jpg';
}

document.getElementById('double').addEventListener('click', playerDouble);
document.getElementById('split').addEventListener('click', playerSplit);

function playerDouble() {
    // Double the current bet
    currentBet *= 2;
    // Player receives one more card
    playerHand.push(deck.pop());
    playerScore = calculateScore(playerHand);
    updateUI();
    updateScoreboard();
    // Proceed to stand automatically
    playerStand();
}

function playerSplit() {
    // Check if the player's hand can be split
    if (playerHand.length !== 2 || playerHand[0].value !== playerHand[1].value) {
        alert("You cannot split your hand.");
        return;
    }
    // Split the hand into two separate hands
    let hand1 = [playerHand[0], deck.pop()];
    let hand2 = [playerHand[1], deck.pop()];
    // Play each hand separately
    playerHand = hand1;
    playerScore = calculateScore(playerHand);
    updateUI();
    updateScoreboard();
    playerHit(); // Player plays the first hand
    setTimeout(function() {
        playerHand = hand2;
        playerScore = calculateScore(playerHand);
        updateUI();
        updateScoreboard();
        playerHit(); // Player plays the second hand
    }, 1000); // Add a delay between playing the two hands for better visualization
}
