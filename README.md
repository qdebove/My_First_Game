** Sorry, English is not my native language **

NEWS : Now, the client side is jQuery free, so VanillaJS will not worked on all browser (for example, see http://caniuse.com/#search=event for event...).
26/03/17 NEWS bis : Server side refactored thanks to typescript (and so POO). 

# My First Game

## I. Introduction

My first game, created without any refactoring. Using jQuery and old JS without good graphics ! --> Not now ^^.

## II. Biography

I think I should introduced myself :

My name is Quentin DEBOVE, a French guy who started coding on June 2016.

My previous job was optometrist, but due to some personals problems I choose to be reoriented in programming.

I started learning HTML 5, CSS 3, jQuery. After some weeks, I learn NodeJS (with express framework).

Since October, I study in the CEFIM of Tours (a town in France) and learn more on SQL, PHP and Java.

This first game, without any title (because it don't deserved at) was started around mid-July and after a small month, was terminated. After, I started an API on NodeJS.

So finally, this is my first "official" version, you'll have access to the API and can play multiple game at the same time. Enjoy it !

## III. Rules

The most difficult point for me because they are only temporary.

The game is a simple battle card game with a small medieval environment.

### 1. Affinity

You have 3 types of card : Shield, Axe and Bow.

So if your are familiar with Strategic Games like Age of Empire, you know that :

* Shield beat Bow and loose over Axe.
* Bow beat Axe and loose over Shield.
* Axe beat Shield and loose over Bow.

### 2. Bonus / Malus

Each card have a bonus, malus (or nothing) value. This value is applied at the next turn if the effect written on the card is occurred.

For example, if you loose with a +3 bonus card, you'll have a bonus effect of + 3 for the next turn.

Be warned : the bonus / malus is useful only if you make a draw.

### 3. Points

Each card give a amount of point if you win a turn.

* The small cards provides more points, but in case of equality, they suffer of they lack of power.
* Mid-power cards provides no points.
* High-power cards provides a small amount of points.

### 4. Progress of a turn

Until all cards have been played, at the end of each turn you and the bot draw a card.

Each turn, you can look at the graveyard, look at your cards, waiting for mathematical calculation of statistics...

You must play a card each turn. Be aware that the bot will play random-like.

### 5. Case of equality

If both player played the same type of card (Shield, Axe or Bow), the game add the power of your card and your actual bonus / malus and do the same with the bot. Finally, the game compared the total power of your card and bot's card.

Of course, if your total value is equal to the total value of the bot, it's a draw and nothing happen.

### 6. End of the game

When you have no card (and of course the same for the bot will perforce happened), the winner is the player with the highest point. Draw is available.

## IV How to launch it

Install NodeJS, use your terminal to go to the directory of the API and use :
```
npm install.
```
Finally write
```
node api1.js
```
and go to
```
localhost:3000
```
and enjoy it.

## V Future

On heroku, I have migrated a server based on NodeJS, and implemented both PvP (Player versus Player) and PvB (Player versus Bot).

URL's are :

* For PvP => http://another-mirai.herokuapp.com/
* For PvE => http://another-mirai-pve.herokuapp.com/

Next task : socket.io for multi-player (the actual PvP is using awfull pollying and all inconvenients...).

## VI version

No versioning is used, so I'll say that this is the 2.0 of this game, but the online games are not using this version.

## VII Thanks

Many thanks to my "mentor", Ludovic Lafole.

Thanks to Cap'n who's the artist for the card's graphics.
Thanks to Boudinator who is the artist for the policy of the cards.
Thanks to Asmaaraq from http://freepik.com.

And thanks to me, event if I'm a little bit narcissistic ^^
