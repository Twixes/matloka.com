// Adapted from https://codepen.io/Twixes/pen/xxpKxZw; no runtime dependencies.
;(() => {
    const calculator = document.querySelector('.float-calculator')
    const input = calculator.querySelector('input')
    const bitArray = calculator.querySelector('.bit-array')
    const significand = calculator.querySelector('button.significand')
    // Explicit big-endian byte order keeps bit positions independent of the machine.
    const view = new DataView(new ArrayBuffer(8))
    let binary = false

    const format = (value) => (Object.is(value, -0) ? '-0' : String(value))
    const buttons = Array.from({ length: 64 }, (_, index) => {
        const button = document.createElement('button')
        const field = index === 0 ? 'sign' : index < 12 ? 'exponent' : 'significand'
        button.type = 'button'
        button.className = `bit bit--${field}`
        button.setAttribute('aria-label', `Bit ${index} (${field})`)
        button.addEventListener('click', () => {
            const byte = Math.floor(index / 8)
            view.setUint8(byte, view.getUint8(byte) ^ (1 << (7 - (index % 8))))
            render()
        })
        bitArray.append(button)
        return button
    })

    function render(updateInput = true) {
        const value = view.getFloat64(0)
        if (updateInput) input.value = format(value)
        const bits = Array.from({ length: 8 }, (_, index) => view.getUint8(index).toString(2).padStart(8, '0')).join('')
        const exponent = parseInt(bits.slice(1, 12), 2)
        const fraction = bits.slice(12)
        buttons.forEach((button, index) => {
            button.textContent = bits[index]
            button.classList.toggle('bit--1', bits[index] === '1')
            button.setAttribute('aria-pressed', String(bits[index] === '1'))
        })
        calculator.querySelector('.formula').hidden = exponent === 2047
        const special = calculator.querySelector('.special-value')
        special.hidden = exponent !== 2047
        special.textContent = Number.isNaN(value) ? 'NaN (not a number)' : format(value)
        calculator.querySelector('.formula .sign').textContent = bits[0]
        calculator.querySelector('.formula .exponent').textContent = exponent || 1
        calculator.querySelector('.leading').textContent = exponent ? '1' : '0'
        // Round the exact fraction / 2^52 to 21 decimal places, as in the original.
        const decimal = ((BigInt(`0b${fraction}`) * 10n ** 21n + 2n ** 51n) / 2n ** 52n)
            .toString()
            .padStart(21, '0')
        calculator.querySelector('.significand-fraction').textContent =
            (binary ? fraction : decimal).replace(/0+$/, '') || '0'
        significand.querySelector('sub').hidden = !binary
        significand.setAttribute('aria-label', `Show significand in ${binary ? 'decimal' : 'binary'}`)
    }

    input.addEventListener('input', () => {
        const text = input.value.trim()
        const value = Number(text)
        // Leave incomplete input alone so negatives and scientific notation can be typed.
        if (text && (!Number.isNaN(value) || text === 'NaN')) {
            view.setFloat64(0, value)
            render(false)
        }
    })
    input.addEventListener('change', () => render())
    significand.addEventListener('click', () => {
        binary = !binary
        render(false)
    })
    const suggestions = calculator.querySelector('.suggestions')
    for (const value of [1, 0.2, Infinity, NaN, -0, 0.3333333333333333, 8e-323]) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'shortcut'
        button.textContent = format(value)
        button.addEventListener('click', () => {
            view.setFloat64(0, value)
            render()
        })
        suggestions.append(button)
    }
    view.setFloat64(0, 10)
    render()
})()
