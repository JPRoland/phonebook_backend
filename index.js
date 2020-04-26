require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

const PORT = process.env.PORT || 3001

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
const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return res.status(400).send({ error: 'Malformatted id' })
    }

    next(error)
}

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(errorHandler)

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people.map(person => person.toJSON()))
    })
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Missing name or number' })
    }

    if (persons.some(p => p.name === body.name)) {
        return res.status(400).json({ error: `${body.name} already exists` })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (!person) {
            return res.status(404).end()
        }
        res.json(person.toJSON())
    }).catch(err => {
        next(err)
    })
})

app.put('/api/persons/:id', async (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(result => {
        res.status(204).end()
    }).catch(err => next(err))
})

app.get('/info', (req, res) => {
    const date = new Date()
    Person.countDocuments()
        .then(count => {
            res.send(`<div>
                        <p>Phonebook has info for ${count} people</p>
                        <p>${date.toString()}</p>
                      </div>`)
        })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})