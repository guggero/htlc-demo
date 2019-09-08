const boxOffsetY = 60;
const boxOffsetX = 12;
const gap = 8;
const boxWidth = 250;
const outputHeight = 25;
const height = 6*outputHeight + 3*gap;
const heightHtlc = height + 5*outputHeight + gap;
const fontSize = 14;
const fontOffset = 2;
const lineHeight = outputHeight;
const outputAmountWidth = 4*gap;
const outputAmountHeight = outputHeight - gap;

function _isArray(obj) {
    return Array.isArray(obj);
}

function _isFunction(obj) {
    return obj && {}.toString.call(obj) === '[object Function]';
}

function _multilineText(elem, lines) {
    lines.forEach((line, index) => {
        elem.append('tspan')
            .attr('x', 1.5*gap)
            .attr('dy', `${index === 0 ? 0 : lineHeight}px`)
            .style('white-space', 'pre')
            .text(line);
    });
}

function _textRight(node, x, y, text) {
    const textElem = node.append('text')
        .attr('class', 'code-text text-right')
        .attr('x', x + outputAmountWidth - 0.5*gap)
        .attr('y', y - 0.5*gap + outputHeight/2 + fontSize/2 - fontOffset);

    if (_isFunction(text)){
        textElem.text(text);
    } else {
        _multilineText(textElem, _isArray(text) ? text : [text]);
    }
}

function _singleOutputAmount(node, x, y, color, text) {
    // output color
    node.append('rect')
        .attr('fill', color)
        .attr('x', x)
        .attr('y', y)
        .attr('width', outputAmountWidth)
        .attr('height', outputAmountHeight)
        .attr('rx', 2);

    // output amount text
    _textRight(node, x, y, text);
}

function _combinedOutputAmount(node, x, y, color, text) {
    // output color variable part
    node.append('polygon')
        .attr('fill', color)
        .attr('points', `${x},${y} ${x + outputAmountWidth},${y} ${x},${y + outputAmountHeight}`);

    // output color fixed part (red)
    node.append('polygon')
        .attr('fill', '#f00')
        .attr('points', `${x + outputAmountWidth},${y} ${x + outputAmountWidth},${y + outputAmountHeight} ${x},${y + outputAmountHeight}`);

    // output amount text
    _textRight(node, x, y, text);
}
