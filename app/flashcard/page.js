'use client'

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from "@/firebase"

import { useSearchParams } from "next/navigation"
import { Box, Button, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, TextField, Typography } from "@mui/material"

export default function Flashcard() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])

    const searchParams = useSearchParams()
    const count = 1;
    const search = searchParams.get('id') // get the id of the pagess

    useEffect(() => {
        async function getFlashcard() {
            if (!search || !user) return
            const colRef = collection(doc(collection(db, 'users'), user.id), search)
            const docs = await getDocs(colRef) // will get all the documents in that collection reference, colRef
            const flashcards = []

            docs.forEach((doc) => {
                flashcards.push({id: doc.id, ...doc.data()})
            })
            setFlashcards(flashcards)
        }
        getFlashcard()
        }, [user, search])
    
    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id] : !prev[id],
        }))
    }

    if (!isLoaded || !isSignedIn) {
        return <></> // doesnt exist, return NULL
    }

    return (
        <Container maxWidth = "100vw">
            <Grid container spacing={3} sx={{mt:4}}>
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
        </Container>
    )
}