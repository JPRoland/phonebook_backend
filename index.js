const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const PORT = 3001

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

const generateId = () => {
    return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))
}

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Missing name or number' })
    }

    if (persons.some(p => p.name === body.name)) {
        return res.status(400).json({ error: `${body.name} already exists` })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    res.json(person)
})

app.get('/api/persons/:id', (req, res) => {
    const person = persons.find(p => p.id === Number(req.params.id))

    if (!person) {
        return res.status(404).json({ error: 'Person not found' })
    }

    res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
    persons = persons.filter(p => p.id !== Number(req.params.id))

    res.status(204).end()
})

app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date.toString()}</p>
    </div>`)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})