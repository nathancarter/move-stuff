
import { popup, unPopup, popupIsVisible } from './popup.js'
import { levels } from './levels.js'
import { Int3 } from './int3.js'
import { Spinner } from './spinner.js'
import { Poker } from './poker.js'

let game = null
export const setGame = g => {
    game = g
    levelPicked( levels[0].name ) // fill with a default level
}

export const showWelcomeDialog = () => popup( `
    <center>
        <h1>Move Stuff</h1>
        <p>an experimental game</p>
        <input type='button' value='Choose a level' onclick='showLevelChoiceDialog()'/>
        <input type='button' value='See help page' onclick='showHelpDialog()'/>
    </center>
    <p>This experimental version of the game uses very crude geometric shapes
    and does not have any sound effects.  Maybe later I will add those things,
    but for creating and solving puzzles, they are not strictly necessary.
    They just make the game more fun and immersive, so they are low priority
    while I work to see if the game's puzzles are interesting in the first place.</p>
`, game.view.domElement )

window.showLevelChoiceDialog = () => {
    let levelChoices = ''
    for ( let i = 0 ; i < levels.length ; i++ ) {
        if ( levels[i].section
          && ( i == 0 || levels[i].section != levels[i-1].section ) ) {
            if ( levelChoices.length > 0 )
                levelChoices += '</p>'
            levelChoices += `<h2>${levels[i].section}</h2>\n<p>`
        }
        levelChoices += `<input type='button' value='${i+1}. ${levels[i].name}'
            onclick='levelPicked("${levels[i].name}")'/> `
    }
    levelChoices += '</p>'
    return popup( `
        <center>
            <h1>Choose a level to play or edit:</h1>
            ${levelChoices}
        </center>
    `, game.view.domElement )
}

window.levelPicked = name => {
    game.setState( levels.find( level => level.name == name ) )
    game.saveState()
    unPopup()
}

const showLevelJSON = () => {
    const popupWindow = popup( `
        <h1>Level definition in JSON format</h1>
        <hr/>
        <h2>Compact form</h2>
        <textarea id="levelJSONSmall" readonly
                  style="width: 100%; height: 2em;"
        >${JSON.stringify( game.state() )}</textarea>
        <p><a id="downloadCompact">Download link</a></p>
        <hr/>
        <h2>Readable form</h2>
        <textarea id="levelJSONLarge" readonly
                  style="width: 100%; height: 20em;"
        >${JSON.stringify( game.state(), null, 4 )}</textarea>
        <p><a id="downloadReadable">Download link</a></p>
    `, game.view.domElement )
    popupWindow.querySelector( '#levelJSONLarge' ).select()
    popupWindow.querySelector( '#levelJSONSmall' ).select()
    const compactURI = 'data:text/json;charset=utf-8,'
        + encodeURIComponent( JSON.stringify( game.state() ) )
    const compactAnchor = popupWindow.querySelector( '#downloadCompact' )
    compactAnchor.setAttribute( 'href', compactURI )
    compactAnchor.setAttribute( 'download', 'level.json' )
    const readableURI = 'data:text/json;charset=utf-8,'
        + encodeURIComponent( JSON.stringify( game.state(), null, 4 ) )
    const readableAnchor = popupWindow.querySelector( '#downloadReadable' )
    readableAnchor.setAttribute( 'href', readableURI )
    readableAnchor.setAttribute( 'download', 'level.json' )
}

window.showHelpDialog = () => popup( `
    <center>
        <h1>Controls</h1>
        <table style="width: 100%;" border=1 cellspacing=0 cellpadding=10>
            <tr style="background-color: #dddddd;">
                <th>Keyboard/mouse action</th>
                <th>Result</th>
            </tr>
            <tr>
                <td>Enter</td>
                <td>Choose a level to edit or play</td>
            </tr>
            <tr>
                <td>Click and drag</td>
                <td>Rotate viewpoint</td>
            </tr>
            <tr>
                <td>Scroll mouse wheel</td>
                <td>Zoom view in/out</td>
            </tr>
            <tr>
                <td>?</td>
                <td>Show this help</td>
            </tr>
            <tr>
                <td>Escape</td>
                <td>Hide info screen/show welcome screen</td>
            </tr>
            <tr>
                <th colspan=2 style="background-color: #eeeeee;">
                    <center>While playing a level</center>
                </th>
            </tr>
            <tr>
                <td>Click an object</td>
                <td>Activate/use the object</td>
            </tr>
            <tr>
                <td>r</td>
                <td>Reset the current level</td>
            </tr>
            <tr>
                <td>Tab</td>
                <td>Turn on edit mode</td>
            </tr>
            <tr>
                <th colspan=2 style="background-color: #eeeeee;">
                    <center>While editing a level</center>
                </th>
            </tr>
            <tr>
                <td>Arrow keys</td>
                <td>Move 3d cursor (white wireframe) horizontally</td>
            </tr>
            <tr>
                <td>w, s</td>
                <td>Move 3d cursor (white wireframe) vertically</td>
            </tr>
            <tr>
                <td>Shift + arrows/w/s</td>
                <td>Move entire level in that direction, if possible</td>
            </tr>
            <tr>
                <td>Click an object</td>
                <td>Move the cursor there</td>
            </tr>
            <tr>
                <td>1</td>
                <td>Insert a floor block</td>
            </tr>
            <tr>
                <td>2</td>
                <td>Insert a game piece</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Insert a goal</td>
            </tr>
            <tr>
                <td>4</td>
                <td>Insert a spinner</td>
            </tr>
            <tr>
                <td>5</td>
                <td>Insert a poker</td>
            </tr>
            <tr>
                <td>0</td>
                <td>Insert a bouncing, numbered hint</td>
            </tr>
            <tr>
                <td>Backspace</td>
                <td>Delete object under cursor</td>
            </tr>
            <tr>
                <td>j, k, l</td>
                <td>Cycle features of object under cursor (though not all objects
                    have three features to adjust)</td>
            </tr>
            <tr>
                <td>x</td>
                <td>Cut item under cursor</td>
            </tr>
            <tr>
                <td>c</td>
                <td>Copy item under cursor</td>
            </tr>
            <tr>
                <td>v</td>
                <td>Paste copied/cut item to cursor location</td>
            </tr>
            <tr>
                <td>Slash (/)</td>
                <td>Show JSON code for current level</td>
            </tr>
            <tr>
                <td>Tab</td>
                <td>Turn off edit mode</td>
            </tr>
        </table>
    </center>
`, game.view.domElement )

const generalResponses = {
    'Enter'      : showLevelChoiceDialog,
    'Escape'     : () => popupIsVisible() ? unPopup() : showWelcomeDialog(),
    '?'          : showHelpDialog,
    'Tab'        : () => game.setEditing( !game.isEditing() ),
}
const editingResponses = {
    'ArrowLeft'  : () => game.moveCursor( Int3.L ),
    'ArrowRight' : () => game.moveCursor( Int3.R ),
    'ArrowUp'    : () => game.moveCursor( Int3.F ),
    'ArrowDown'  : () => game.moveCursor( Int3.B ),
    'w'          : () => game.moveCursor( Int3.U ),
    's'          : () => game.moveCursor( Int3.D ),
    '1'          : () => game.addFromJSON( { type : 'floor' }, true ),
    '2'          : () => game.addFromJSON( { type : 'token' }, true ),
    '3'          : () => game.addFromJSON( { type : 'goal' }, true ),
    '4'          : () => game.addFromJSON( { type : 'spinner' }, true ),
    '5'          : () => game.addFromJSON( { type : 'poker' }, true ),
    '0'          : () => game.addFromJSON( { type : 'hint' }, true ),
    'Backspace'  : () => game.deletePieceAtCursor(),
    'j'          : target => target?.cycleFinite( 0, 1 ),
    'k'          : target => target?.cycleFinite( 1, 1 ),
    'l'          : target => target?.cycleFinite( 2, 1 ),
    '/'          : showLevelJSON,
    'x'          : () => game.cut(),
    'c'          : () => game.copy(),
    'v'          : () => game.paste()
}
const shiftEditingResponses = {
    'ArrowLeft'  : () => game.shiftBoard( Int3.L ),
    'ArrowRight' : () => game.shiftBoard( Int3.R ),
    'ArrowUp'    : () => game.shiftBoard( Int3.F ),
    'ArrowDown'  : () => game.shiftBoard( Int3.B ),
    'W'          : () => game.shiftBoard( Int3.U ),
    'S'          : () => game.shiftBoard( Int3.D )
}
const playingResponses = {
    'r'          : () => game.restoreState()
}
document.addEventListener( 'keydown', event => {
    if ( event.ctrlKey || event.metaKey ) return
    if ( popupIsVisible() && !['Escape','Enter','?'].includes( event.key ) )
        return
    const responses = {
        ...generalResponses,
        ...( game.isEditing() ? editingResponses : playingResponses ),
        ...( event.shiftKey ? shiftEditingResponses : { } )
    }
    if ( responses.hasOwnProperty( event.key ) ) {
        responses[event.key]( game.cursor && game.pieceAt( game.cursor.pos() ) )
        return event.preventDefault()
    }
} )

document.addEventListener( 'click', event => {
    // If they didn't click anything, quit
    const clicked = game.objectsUnderMouse( event )
    if ( clicked.length == 0 ) return
    // If it wasn't a piece on the board, quit
    const target = game.board.find( piece => piece.repr == clicked[0] )
    if ( !target ) return
    // If we're in edit mode, clicking moves the cursor
    if ( game.isEditing() && game.cursor ) {
        game.moveCursor( target.pos().minus( game.cursor.pos() ) )
    // If the game is animating something, it can't take any "play" clicks
    } else if ( game.isAnimating() ) {
        return
    // If we're not in edit mode, clicking uses objects
    } else if (
        target && ( ( target instanceof Spinner )
                 || ( target instanceof Poker ) )
    ) {
        target.play( 'use' )
        // and if the user followed a hint we gave, advance the hint counter
        const nextHint = game.firstVisibleHint()
        const hintUsed = game.hintForPos( target.pos() )
        if ( hintUsed > 0 && hintUsed == nextHint )
            game.showOneHint( hintUsed + 1 )
        else
            game.showAllHints( false )
    }
} )
