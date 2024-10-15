'use client'
import { useUser } from "@clerk/nextjs"
import { use, useEffect, useState } from "react"

import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { useRouter } from "next/navigation"
import { Router } from "next/router"
import { Card, CardActionArea, CardContent, Container, Grid, Typography } from "@mui/material"

// show all the flashcards in firebase
export default function Flashcards() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()
    
    useEffect(() =>{
        async function getFlashcards() {
            if (!user) return // if there is no user, we dont run this function, so just return
            const docRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || [] // if it doesnt exist, we have an empty array
                setFlashcards(collections)
            }
            else{
                await setDoc(docRef, {flashcards: []})
            }
        }
        getFlashcards()
    }, [user])

    if (!isLoaded || !isSignedIn) { // we dont want the page to load if the user is not Signed In
        return <></>
    }

    // handling each individual card
    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`)
    }

    return (
        <Container maxWidth="100vw">
            <Grid container spacing = {3} sx = {{mt :4}}>
                {flashcards.map((flashcard, index) => (
                    <Grid item xs = {12} sm = {6} md={4} key={index}>
                        <Card>
                            <CardActionArea onClick={() => {
                                handleCardClick(flashcard.name)
                            }}
                            >
                                <CardContent>
                                    <Typography variant = 'h6'>
                                        {flashcard.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}
