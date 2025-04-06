const express = require('express')
const User = require('../model/user')

const router = express.Router()

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

router.get('/signin', (req, res) => {
    if (req.session.name) {
        return res.redirect('/home')
    }
    res.render('auth/signin', { errorMsg: null })
})

router.post('/signin', async (req, res) => {
    const { name, password } = req.body
    try {
        const olduser = await User.findOne({ name })
        if (olduser) {
            return res.render('auth/signin', { errorMsg: 'This user already has an account' })
        }

        const user = new User({ name, password })
        await user.save()

        req.session.userId = user._id;
        req.session.name = user.name;

        res.render('home', { name: req.session.name })

    } catch (e) {
        res.status(500).send('registration error')
    }
})

router.get('/login', (req, res) => {
    if (req.session.name) {
        return res.redirect('/home')
    }
    res.render('auth/login', { errorMsg: null })
})

router.post('/login', async (req, res) => {
    const { name, password } = req.body
    try {
        const olduser = await User.findOne({ name })
        if (!olduser) {
            console.log('no user found');
            return res.render('auth/login', { errorMsg: 'No user found' })
        }

        if (olduser.password == password) {
            try {
                req.session.userId = olduser._id
                req.session.name = olduser.name
                return res.redirect('/home')
            } catch (error) {
                console.log(error);
            }

        }

        return res.render('auth/login', { errorMsg: 'Username or password is incorrect' })

    } catch (e) {
        console.log(e);
        res.status(500).send('login error')
    }
})

module.exports = router
