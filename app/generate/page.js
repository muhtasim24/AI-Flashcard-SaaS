'use client'

import { useUser } from "@clerk/nextjs"
import { Box, Button, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, TextField, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { db } from "@/firebase"
import { doc, collection, setDoc, getDoc, writeBatch } from "firebase/firestore"



export default function Generate(){
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState('')
    const router = useRouter

    // will submit our text to generate flashcards from api
    const handleSubmit = async () => {
        fetch('api/generate', {
            method: 'POST', // sending in the method, POST
            body: text, // sending in the text
        })
        .then((res) => res.json()) // response, process as JSON
        // take the data, set the flashcards with the data
        .then((data) => setFlashcards(data)) 
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id] : !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name')
            return
        }

        const batch = writeBatch(db) // make a batch so we can set all at once
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef) // document Snapshot

        if(docSnap.exists()) { // if the docSnap exists
            const collections = docSnap.data().flashcards || []
            // if collections already exists
            if (collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists')
                return
            // if collections doesnt exist
            } else {
                collections.push({name})
                // set merge to true, so we dont override previous data
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        // if docSnap does not exist, we are going to set it
        } else {
            batch.set(userDocRef, {flashcards: [{name}]})
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard) // want to use batch so we dont spend too much money and we do it all at once
        })

        await batch.commit()
        handleClose()
        router.push('/flashcards') // pushes us to our flashcard page
    }

    // component 
    return (
    <Container maxWidth="mx">
        <Box sx = {{
            mt:4,
            mb: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}
        >
            <Typography variant='h4'> Generate Flashcards</Typography>
            <Paper sx ={{p: 4, width: '100%'}}>
                <TextField 
                    value = {text} 
                    onChange={(e) => setText(e.target.value)}
                    label = "Enter text"
                    fullWidth
                    multiline
                    rows = {4}
                    variant = 'outlined'
                    sx={{
                        mb:2
                    }} 
                />
                <Button
                    variant ='contained'
                    color = 'primary'
                    onClick = {handleSubmit}
                    fullWidth
                    >
                        Submit
                </Button>
            </Paper>
        </Box>

        {flashcards.length > 0 && (
        <Box sx={{mt: 4}}>
            <Typography variant = 'h5'> Flashcards Preview</Typography>
            <Grid container spacing ={3}>
                {flashcards.map((flashcard, index) => (
                    <Grid item xs = {12} sm = {6} md={4} key = {index}>
                        <CardActionArea onClick = {() => {
                            handleCardClick(index)
                        }}
                        >
                            <CardContent>
                                <Box sx = {{
                                    perspective: "1000px",
                                    '& > div': {
                                        transition: 'transform 0.6s',
                                        transformStyle: 'preserve-3d',
                                        position: 'relative',
                                        width: '100%',
                                        height: '200px',
                                        boxShadow: '0 4px 8px 0 rgba(0,0,0, 0.2)',
                                        transform: flipped[index]
                                            ? 'rotateY(180deg)'
                                            : 'rotateY(0deg)'
                                    },
                                    '& > div > div': {
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: 2,
                                        boxSizing: 'border-box'
                                    },
                                    '& > div > div:nth-of-type(2)': {
                                        transform: 'rotateY(180deg)',
                                    },
                                }}
                                >
                                    <div>
                                        <div>
                                            <Typography variant ='h5' component = 'div'>
                                                {flashcard.front}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant ='h5' component = 'div'>
                                                {flashcard.back}
                                            </Typography>
                                        </div>
                                    </div>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Grid>
                ))}
            </Grid>
            <Box sx = {{mt: 4, display: 'flex', justifyContent: 'center'}}>
                <Button variant ='contained' color ='secondary' onClick={handleOpen}>
                    Save
                </Button>
            </Box>
        </Box>
        )}

        <Dialog open = {open} onClose = {handleClose}>
            <DialogTitle> Save Flashcards </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for your flashcards collection
                </DialogContentText>
                <TextField
                    autoFocus
                    margin = 'dense'
                    label = 'Collection Name'
                    type = 'text'
                    fullWidth 
                    value = {name}
                    onChange={(e) => setName(e.target.value)}
                    variant = 'outlined'
                >
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}> Cancel </Button>
                <Button onClick={saveFlashcards}> Save </Button>
            </DialogActions>
        </Dialog>
    </Container>
    )
}