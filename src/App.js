import React, {useEffect, useState} from "react";
import './App.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


function App() {

    const [downloadFiles, setDownloadFiles] = useState([])
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)

    const handleClick =  () => {
        const validUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

        console.log('validUrl.test(value)', validUrl.test(value))
        if (validUrl.test(value)) {
            ipcRenderer.send('download', {
                    payload: {
                        url: value,
                    }
                });
        } else {
            setError("invalid value on url")
        }
    }

    const handleChange = (e) => {
        setError(null)
        setValue(e.target.value)
    }

    const handleClickLink = (path) => {
        ipcRenderer.send('openFile', {path});
    }

    const updateStateDownloadFiles = (newFile) => {
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
            return newState
        });
    }

    useEffect(() => {

        ipcRenderer.on('download-complete', (event, item) => {
            const newFile = {
                fileName: item.path.split('\\').pop(),
                fileSize: item.fileSize,
                path: item.path
            };

            updateStateDownloadFiles(newFile)
            setValue('')
        });


    }, [])


  return (
    <div className="root">
        <label  className={error && "hidden"}>
            enter url address:
        <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="http://..."
        />

        </label>
        {error && <p className="error" >{error}</p>}
        <button disabled={!value.length>0} onClick={handleClick}>get file</button>
        <ol>
            {downloadFiles.map(file => (
                <li key={file.fileName}><button onClick={() => handleClickLink(file.path)}>{file.fileName}</button></li>
                )
            )}
        </ol>



    </div>
  );
}

export default App;
