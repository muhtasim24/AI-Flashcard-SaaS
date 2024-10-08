'use client'

import { useUser } from "@clerk/nextjs"
import { collection, getDoc, writeBatch } from "firebase/firestore"
import { useRouter } from "next/navigation"



export default function Generate(){
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setTexted] = useState('')
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
        .then(data > setFlashcards(data)) 
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id] : !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpenI(true)
    }

    const handleClose = () => {
        setOpenI(false)
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
}