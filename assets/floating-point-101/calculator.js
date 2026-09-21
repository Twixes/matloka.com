// Adapted from https://codepen.io/Twixes/pen/xxpKxZw; no runtime dependencies.
;(() => {
    const calculator = document.querySelector('.float-calculator')
    const input = calculator.querySelector('input')
    const buttons = calculator.querySelectorAll('.bit')
    const significand = calculator.querySelector('button.significand')
    // Explicit big-endian byte order keeps bit positions independent of the machine.
    const view = new DataView(new ArrayBuffer(8))
    let binary = false

    const format = (value) => (Object.is(value, -0) ? '-0' : String(value))

    function render(updateInput = true) {
        const value = view.getFloat64(0)
        if (updateInput) input.value = format(value)
        const bits = view.getBigUint64(0).toString(2).padStart(64, '0')
        const exponent = parseInt(bits.slice(1, 12), 2)
        const fraction = bits.slice(12)
        buttons.forEach((button, index) => {
            button.textContent = bits[index]
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
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            view.setBigUint64(0, view.getBigUint64(0) ^ (1n << BigInt(63 - index)))
            render()
        })
    })
    calculator.querySelectorAll('[data-value]').forEach((button) => {
        button.addEventListener('click', () => {
            view.setFloat64(0, Number(button.dataset.value))
            render()
        })
    })
    view.setFloat64(0, Number(input.value))
    render()
})()
