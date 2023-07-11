
Fixes

 - Ensure that everything that should prevent motion implements `allowsMove()`.
 - Test that tokens shake or bounce if they cannot move.

Features

 - Upgrade spinners to not rotate at all if any poked token cannot move
 - Show fireworks if a level is finished (and not in edit mode)
 - Add more floor types for visual variety and see-through-ability
 - Shift+1/2/3/4 adds hint markers

New types of items

 - Slow poker that hits more gently, so tokens fall in the first available hole
 - Flipper that can launch something up one level in y with some sideways motion
 - Wall spinner, which rotates adjacent walls in the xy/yz/zx plane
 - Conveyor belts (which can be inactive until something falls on them)
 - Thin walls that prevent motion in 2 directions and bounce in the other 2
 - Gray tokens with no goal locations, nor any need to get them to a goal

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
