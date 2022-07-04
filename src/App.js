import React, {useEffect, useRef, useState} from "react";
import './App.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


function App() {

    //const [downloadProgress, setDownloadProgress] = useState(0)
    const [downloadFiles, setDownloadFiles] = useState([])

    const [value, setValue] = useState('')

    const handleClick =  () => {
        console.log('handleClick', value)
        setValue('')
        ipcRenderer.send('download', {
            payload: {
                url: value,
            }
        });

    }

    useEffect(() => {

        ipcRenderer.on('download-complete', (event, args) => {
            const newFile = {
                fileName: args.fileName,
                fileSize: args.fileSize,
                path: args.path
            };

            setDownloadFiles( prevState => {
                const newState = prevState;
                if (prevState.find(file => file.fileName === newFile.fileName)) {
                    return newState
                }

                if (prevState.length >= 5) {
                    newState.shift();
                    newState.push(newFile)
                } else {
                    newState.push(newFile)
                }
                console.log('setDownloadFiles', newState)
                return newState
            });

        });

    }, [])

  return (
    <div>
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)}/>
        <button onClick={handleClick}>get file</button>
        <ul>
            {downloadFiles.map(file => (
                <li key={file.fileName}><a href={'#'}>{file.fileName}</a></li>
                )
            )}
        </ul>

        <p>{value}</p>

    </div>
  );
}

export default App;
