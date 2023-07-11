
let popupElement = null

export const popup = ( html, overThis ) => {
    if ( popupElement ) unPopup()
    const margin = 50
    popupElement = overThis.ownerDocument.createElement( 'div' )
    popupElement.style.position = 'absolute'
    popupElement.style.display = 'block'
    popupElement.style.width = ( overThis.getBoundingClientRect().width - 2*margin ) + 'px'
    popupElement.style.height = ( overThis.getBoundingClientRect().height - 2*margin ) + 'px'
    popupElement.style.top = margin + 'px'
    popupElement.style.left = margin + 'px'
    popupElement.style.backgroundColor = 'white'
    popupElement.style.overflow = 'scroll'
    popupElement.innerHTML = '<div style="text-align: right; margin: 20px;"></div>'
                           + '<div style="margin: 20px;"></div>'
    const close = overThis.ownerDocument.createElement( 'span' )
    close.textContent = '✖️'
    close.addEventListener( 'click', unPopup )
    popupElement.childNodes[0].appendChild( close )
    popupElement.childNodes[1].innerHTML = html
    overThis.parentNode.insertBefore( popupElement, overThis )
    const focusMe = popupElement.querySelector( '.focus-me' )
    if ( focusMe ) focusMe.focus()
    return popupElement
}

export const unPopup = () => {
    if ( popupElement ) {
        popupElement.remove()
        popupElement = null
    }
}

export const popupIsVisible = () => !!popupElement
