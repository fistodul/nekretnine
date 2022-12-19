function makeEl(tagName, attributes, listener) {
    if (!Object.values(attributes).every(attribute => typeof attribute === 'string')) {
        throw new Error('All attributes must be strings');
    }
    
    let el = document.createElement(tagName);
    Object.assign(el, attributes);
    el.addEventListener("click", listener);

    return el;
}