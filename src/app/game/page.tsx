import React from 'react'

const GamePage = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1sCAoSLEFGMVFpcE1wQ3h6b3Z2b3h6b3Z2b3h6b3Z2b3h6b3Z2b3h6b3Z2b3h6b3Z2!2m2!1d37.869260!2d-122.254811!3f0!4f0!5f0.7820865974627469`}
        allowFullScreen
        aria-hidden="false"
        tabIndex={0}
      ></iframe>
    </div>
  )
}

export default GamePage