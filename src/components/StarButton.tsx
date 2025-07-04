import { Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import Magnet from './Magnet'
import GlareHover from './GlareHover'

const StarButton = () => {
    const [stars, setStars] = useState<number | null>(null)

    useEffect(() => {
        fetch('https://api.github.com/repos/We1chJ/PhotoEye')
            .then(res => res.json())
            .then(data => setStars(data.stargazers_count))
            .catch(() => setStars(null))
    }, [])
    return (
        <Magnet padding={800} disabled={false} magnetStrength={80}>
            <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.3}
                glareAngle={-30}
                glareSize={300}
                transitionDuration={800}
                playOnce={false}
                style={{ display: 'inline-block', width: 'fit-content', height: 'fit-content' }}
            >
                <a href="https://github.com/We1chJ/PhotoEye" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                        Star on GitHub
                        <Star fill="#FFD700" color="#FFD700" />
                        {stars}
                    </Button>
                </a>
            </GlareHover>
        </Magnet>
    )
}

export default StarButton