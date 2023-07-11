
Features

 - Make level JSON uploadable as an editing mechanism
 - Add several levels to showcase the game's initial ingredients and style
    - Multiple tokens, one poke each, with hints
    - Multiple tokens, more than one poke each
    - 2 tokens, need to use one to block another, with hints
    - Multiple tokens, need to use some to block others, no hints
    - Same as previous but there are extra tokens and many blockings needed
    - One spinner, one token, one hint, easy
    - Multiple spinners, one token, no hints, easy
    - 1 spinner, 1 poker, easy, no hints
    - Medium-level combination of spinners and pokers, no hints, flat
    - Same as previous, but now starting to use tokens to block one another
    - Same as previous, but now extra tokens as well
    - Same as previous, but multi-level, not flat
    - >=2 spinners, 1 prevented from moving because of a wall, hints
    - Same as previous, slightly harder, no hints
    - >=2 spinners, bouncing as distinct from shaking, hints
    - Same as previous, slightly harder, no hints
    - Perhaps a few very hard ones
 - Implement `do()` generically as an artificial speed-timer for `play()`

New types of items

 - Slow poker that hits more gently, so tokens fall in the first available hole
 - Flipper that can launch something up one level in y with some sideways motion
 - Wall spinner, which rotates adjacent walls in the xy/yz/zx plane
 - Conveyor belts (which can be inactive until something falls on them)
 - Thin walls that prevent motion in 2 directions and bounce in the other 2
 - Pale gray tokens with no goal locations, nor any need to get them to a goal
 - Pale gray spinners and pokers you cannot click, but activate with a bounce
    - Bounce a token off any side of a spinner to activate it
    - Bounce a token off only the back side of a poker to activate it

Possibilities, not sure yet if these are good

 - A type of token that must be knocked off the puzzle for it to count as a win

Sounds needed

 - Pleasant chime for token entering a goal
 - Fireworks sound for level win
 - Maybe some sound for loading a new level
 - Crack (like billiards) when using a poker
 - Metal gears or cranking sound for using a spinner
 - Falling tone for token falling into the void
 - Gentle bumping sound for token falling a short distance onto any surface
 - Buzzer or grinding for when things fail to move at all (shake)
 - Bouncing sound for when things partially move but bounce back
 - Gentle click/tap sound for slow poker
 - Springy sound for flipper
 - Scraping stone sound like a dungeon temple door for wall spinner
 - Mechanical hum for an operating conveyor belt
