import React, { Component } from 'react';
import BarsCon from './BarsCon'
import BarsGroup from './BarsGroup'


//This was passed a json object and created 'audio bars', where each audio channel had a bar
//which moved up and down with the volume on it

//sample object with 1 channel
// obj={{
//     probedata:{
//         correlation:[0],
//         dbPeak:[0],
//         dbRMS:[0],
//         mean:[0],
//         meanaudio:[0],
//         peakaudio:[1]
//         },
//     properties:{
//         SpokenLanguageV2:[
//             {en:1,es:2,str:'es'}
//         ]
//         }
//     }
// }

class AudioVisualizer extends Component{
    constructor(props){
        super(props)
        this.state = {
            hoverChannel:"",
        }
    }

    componentDidUpdate(prevProps){
        //on update check if video has paused, if so use previous props audio data by storing it in state
        if(prevProps.playing === true && this.props.playing === false){
            this.setState({
                snapShot:prevProps.obj
            })
        }
        //obj.name is a unique number with every new batch of data, 
        //if video is playing and the previous props name and current props name dont match, then clear out the prevProps data from state
        if(prevProps?.obj?.name && prevProps.obj.name !== this.props.obj.name && this.props.playing === false){
            this.setState({
                snapShot:null
            })
        }
    }

    render(){
        //if everything goes wrong we print out this
        let bars = <div id="audioBars"><div>No Data</div></div>

        //check if we have data either as a stored snapshot or because video is playing
        if(this.state.snapShot || this.props.playing){
            //we do, so we dont have to print out 'No Data'
            bars = this.vizualizer();
        }

        return(
            <div id="audioBarsContainer" 
                onMouseOut={this.channelClear}
                style={
                this.props.theme === 'light' ? 
                    {backgroundColor:'white',
                    color:"#121212"} 
                    : 
                    {backgroundColor:'#121212',
                    color:'white'}
                }
                >
                {/* <div id="audioBars" className={'t'+this.props.type.value}> */}
                    {bars}
                {/* </div> */}
                <div id="decLabelsLeft" className="decLabels">
                    <div className="l10 decLabel">-10</div>
                    <div className="l30 decLabel">-30</div>
                    <div className="l50 decLabel">-50</div> 
                    <div className="l66 decLabel">-66</div>
                </div>
                <div id="decLabelsRight" className="decLabels">
                    <div className="l10 decLabel">-10</div>
                    <div className="l30 decLabel">-30</div>
                    <div className="l50 decLabel">-50</div> 
                    <div className="l66 decLabel" >-66</div>
                </div>
                <div id="channelLabels">
                        {this.state.hoverChannel}
                    </div>
            </div>
        )
    }

    changeChannel = (event) =>{
        const channel = event.target.getAttribute('data-label')
        this.setState({
            hoverChannel:'audio channel ' + channel
        })
    }

    meanHeight(val){ //normalize values to convert it to a percent
        if(val >= 0){
            val = 100
        }else{
            val = (val / -66) * 100;
        }
        const style = {
            height:val + '%'
        } 
        return(style)
    }

    peakHeight(val){ //normalize values to convert it to a percent
        if(val >=0){
            val = 0
        }else{
            val = ((-66 - val) / -66) * 100
        }
        const style = {
            bottom:val + '%'
        } 
        return(style) 
    }

    barMaker(){
        //some lightmode/darkmode specific inline css
        const themeSelected = this.props.theme === "light" ? '#1a84e8' : '#939bd1'
        const themeBG = this.props.theme === "light" ? '#f2f2f2' : '#272727'

        // get audio data from either the snapshot or the obj prop
        const data = this.props.playing === true ? this.props.obj : this.state.snapShot;
        const means = data?.probedata?.dbRMS
        const peaks = data?.probedata?.dbPeak

        if(peaks === undefined || means === undefined){
            return undefined
        }

        const bars = means.map((data,index) => 
            <div className="meanBar" key={index} >

                <div className="bar" style={this.meanHeight(data)}></div> {/* make a green bar that goes up and down with mean value*/}
                <div className="peakBar" style={this.peakHeight(peaks[index])}></div> {/* make a white line that goes up and down with peak value*/}

                <div className="audioBtnSingle"  // each channel gets a button so you can listen to the audio from just that channel
                    data-channels={[index,1]} 
                    data-label={(index + 1)}
                    data-key={10+index} 
                    onClick={this.props.audioSrcSelect} 
                    onMouseOver={this.changeChannel} 
                    style={{
                        borderColor: this.props.theme === "light" ? "#cccccc" : "#2c3034",
                        backgroundColor: this.props.audioGroup === (10+index) ? themeSelected : themeBG
                    }}></div>
            </div>
        )
        return bars
    }
    correlationMaker(index){ //get the correlation value from the object
        let data = this.props.playing === true ? this.props?.obj?.probedata?.correlation[index] : this.state?.snapShot?.probedata?.correlation[index];
        if(data === undefined){
            data = 0
        }
        let style;
        if(data >= 0){
            style = {
                bottom:"calc(50% - 1px)",
                height:(data * 50) + '%'
            }
        }else{
            style = {
                top:"calc(50% + 1px)",
                height:(data * -50) + '%'
            }
        }
        return(
                <div className="correlationBarCon" cor-num={index}>
                    <div className="correlationBar" style={style}></div>
                </div>
        )

    }

    languageMaker(a,b){ 
        //in a group of audiobars, they each have their own language value
        //this function checks which language is most common in a group of bars
        //a is the index of the first in the group, b is the index of the last in the group

        const lang = this.props.playing === true ? this.props?.obj?.properties?.SpokenLanguage : this.state.snapShot?.properties?.SpokenLanguage;

        if(lang === undefined ){
            return
        }
        
        //get an array of language objects for all relavent channels
        const arr = lang.slice(a,b)
        let bars = []
        let keys = []
        let langs =[]
        //get reported highest and value of each lang/oob-type, add to bars[]
        //get reported highests and add to keys[], check later for lang vs oob
        arr.forEach(bar =>{
            let str = bar.str
            const obj = {}
            if(str !== '&#x266A;' && str !== '-'){
                obj[str] = bar[str]
                //create list of possible languages
                if(langs.indexOf(str) === -1){
                    langs.push(str)
                }
            }else{
                obj[str] = bar.oob
            }
            if(obj[str] !== 0){
                bars.push(obj)
                if(keys.indexOf(str) === -1){
                    keys.push(str)
                }
            }
        })
        let highest = ''
        //check lang vs oob
        if(keys.some(value => {return value !== '&#x266A;' && value !== '-'})){
            //lang overrides oob
            //create values array that matches length of languags
            let vals = new Array(langs.length).fill(0)
            //tally totals of detected languages
            bars.forEach(language =>{
                const langKey = Object.keys(language)[0]
                const langVal = language[langKey]
                const langIndex = langs.indexOf(langKey)
                if(langIndex !== -1){
                    vals[langIndex] = vals[langIndex] + langVal
                }
            })
            //get highest total, and corresponding label
            const max = Math.max(...vals)
            if(max !== 0){
                highest = langs[vals.indexOf(max)]
            }
        }else if(keys.includes('&#x266A;')){
            //&#x266A overrides '-'
            highest = <>&#x266A;</>
        }else if(keys.includes('-')){
            //'-' only
            highest = <>&#9679;</> //oob returns a musical note
        }
        return highest
    }
    
    vizualizer(){ //bars can be grouped in different formats, this sets how the bars are grouped depending on audio format
        
        const bars = this.barMaker()
        if(bars === undefined){
            return <div>No Data</div>
        }
        let con;
        const type = this.props.type.value
        let general = ''
        if(type === 'general'){ // 1,1,1 ... 
            general = 'general'
            con = bars.map((data,index)=>
                <div className="barsCon" key={index} >
                    <div className="audioLangLabel"
                    style={{
                        borderColor: 'rgba(0,0,0,0)',
                        color: this.props.theme === "light" ? "#797979" : "#9e9e9e"
                    }}
                    >
                        
                        <p className="audioLangText"
                            style={{
                                backgroundColor:this.props.theme === "light" ? "white" : "black",
                                color:this.props.theme === "light" ? "black" : "white"
                            }}
                        >
                            {this.languageMaker(index,(index+1))}
                        </p>
                    </div>
                    
                    {data}
                    <div className="labelHolder"
                    data-label={(index + 1)}
                    onMouseOver={this.changeChannel}
                    >
                    </div>
                </div>
            )
        }else if(type === 'stereo_pairs'){ // 2,2,2 ...
            const filtered  = bars.filter((bar, index) => { //get every second bar starting at 0
                return index % 2 === 0
            })
            con = filtered.map((data,index)=>{ //create a pair of bars
                let string = (index * 2+ 1)
                string = string + '-' + (string + 1)
                return (
                    <BarsCon
                        key={index}
                        bar1={data}
                        correlation={this.correlationMaker(index)}
                        bar2={bars[((index * 2) +1)]}
                        label={string}
                        onMouseOver={this.changeChannel}
                        channels={[(index*2),2]}
                        audioSrcSelect={this.props.audioSrcSelect}
                        dataKey={index}
                        theme={this.props.theme}
                        selected={this.props.audioGroup}
                        dataLang={this.languageMaker((index*2),((index *2)+ 2))}
                        />
                )
            })
        }else if(type === "5dot1" || type === "5dot1_stereo"){//6,2, 2 ...
            const first = [
                <BarsGroup //bars group is a group of six bars
                    key={'-1'}
                    bars={bars.slice(0,6)}
                    label={'1-6'}
                    onMouseOver={this.changeChannel}
                    channels={[0,6]}
                    audioSrcSelect={this.props.audioSrcSelect}
                    dataKey={0}
                    theme={this.props.theme}
                    selected={this.props.audioGroup}
                    dataLang={this.languageMaker(0,6)}
                />
            ]
            const sliced = bars.slice(6)//create array of remainders
            const pairs = sliced.filter((bar,index) =>{
                return index % 2 === 0
            })
            const sec = pairs.map((data,index)=>{ //create pairs of remainders
                const str = ((index * 2)+7) +'-'+((index * 2) +8)
                return(
                    <BarsCon //barscon is a group of two bars
                        key={index}
                        bar1={data}
                        correlation={this.correlationMaker(index+3)}
                        bar2={sliced[((index * 2) + 1)]}
                        label={str}
                        onMouseOver={this.changeChannel}
                        channels={[((index*2)+6),2]}
                        audioSrcSelect={this.props.audioSrcSelect}
                        dataKey={index+1}
                        theme={this.props.theme}
                        selected={this.props.audioGroup}
                        dataLang={this.languageMaker((index*2)+6,((index*2) + 8))}
                        />
                )
            })
            con = first.concat(sec)
        }else if(type === "stereo_5dot1"){ //2,6,2, ...
            const first = [ //create one pair
                <BarsCon
                        key={'-1'}
                        bar1={bars[0]}
                        correlation={this.correlationMaker(0)}
                        bar2={bars[1]}
                        label={'1-2'}
                        onMouseOver={this.changeChannel}
                        channels={[0,2]}
                        audioSrcSelect={this.props.audioSrcSelect}
                        dataKey={0}
                        theme={this.props.theme}
                        selected={this.props.audioGroup}
                        dataLang={this.languageMaker(0,2)}
                        />
            ]
            const sec = [
                <BarsGroup
                    key={'0'}
                    bars={bars.slice(2,8)}
                    label={'3-8'}
                    onMouseOver={this.changeChannel}
                    channels={[2,6]}
                    audioSrcSelect={this.props.audioSrcSelect}
                    dataKey={1}
                    theme={this.props.theme}
                    selected={this.props.audioGroup}
                    dataLang={this.languageMaker(2,8)}
                />
            ]
            const sliced = bars.slice(8) //make pairs of the remainders
            const pairs = sliced.filter((bar,index) =>{
                return index % 2 === 0
            })
            const last = pairs.map((data,index) => {
                const str = ((index * 2)+9) +'-'+((index * 2) +10)
                return(
                    <BarsCon
                        key={index + 1}
                        bar1={data}
                        correlation={this.correlationMaker(index+4)}
                        bar2={sliced[((index * 2) + 1)]}
                        label={str}
                        onMouseOver={this.changeChannel}
                        channels={[((index * 2)+ 8),2]}
                        audioSrcSelect={this.props.audioSrcSelect}
                        dataKey={index+2}
                        theme={this.props.theme}
                        selected={this.props.audioGroup}
                        dataLang={this.languageMaker(((index * 2)+ 8),((index * 2)+ 10))}
                        />
                )
            })
            con = first.concat(sec).concat(last)
        }else if(type === 'stereo_mono'){ //2, 1, 1...
            general = type
            const first = [ 
                <BarsCon
                        key={'-1'}
                        bar1={bars[0]}
                        correlation={this.correlationMaker(0)}
                        bar2={bars[1]}
                        label={'1-2'}
                        onMouseOver={this.changeChannel}
                        channels={[0,2]}
                        audioSrcSelect={this.props.audioSrcSelect}
                        dataKey={0}
                        theme={this.props.theme}
                        selected={this.props.audioGroup}
                        dataLang={this.languageMaker(0,2)}
                        />
            ]
            const sliced = bars.slice(2)
            const sec = sliced.map((data,index)=>{ 
                return(
                    <div className="barsCon" key={index + 2} >
                    <div className="audioLangLabel"
                    style={{
                        borderColor: 'rgba(0,0,0,0)',
                        color: this.props.theme === "light" ? "#797979" : "#9e9e9e"
                    }}
                    >
                        
                        <p className="audioLangText"
                            style={{
                                backgroundColor:this.props.theme === "light" ? "white" : "black",
                                color:this.props.theme === "light" ? "black" : "white"
                            }}
                        >
                            {this.languageMaker(index+2)}
                        </p>
                    </div>
                    
                    {data}
                    <div className="labelHolder"
                    data-label={(index + 2)}
                    onMouseOver={this.changeChannel}
                    >
                    </div>
                </div>
                )
            })
            con = first.concat(sec)
        }else if(type === "5dot1_mono"){//6,1, 1 ...
            general = '5dot1mono';
            const first = [
                <BarsGroup
                    key={'-1'}
                    bars={bars.slice(0,6)}
                    label={'1-6'}
                    onMouseOver={this.changeChannel}
                    channels={[0,6]}
                    audioSrcSelect={this.props.audioSrcSelect}
                    dataKey={0}
                    theme={this.props.theme}
                    selected={this.props.audioGroup}
                    dataLang={this.languageMaker(0,6)}
                />
            ]
            const sliced = bars.slice(6)//create array of remainders
            const sec = sliced.map((data,index)=>{ 
                return(
                    <div className="barsCon" key={index + 7} >
                    <div className="audioLangLabel"
                    style={{
                        borderColor: 'rgba(0,0,0,0)',
                        color: this.props.theme === "light" ? "#797979" : "#9e9e9e"
                    }}
                    >
                        
                        <p className="audioLangText"
                            style={{
                                backgroundColor:this.props.theme === "light" ? "white" : "black",
                                color:this.props.theme === "light" ? "black" : "white"
                            }}
                        >
                            {this.languageMaker(index+7)}
                        </p>
                    </div>
                    
                    {data}
                    <div className="labelHolder"
                    data-label={(index + 7)}
                    onMouseOver={this.changeChannel}
                    >
                    </div>
                </div>
                )
            })
            con = first.concat(sec)
        }else{ // 1,1,1 ...
            general = 'general';
            con = bars.map((data,index)=>
                <div className="barsCon" key={index} >
                    <div className="audioLangLabel"
                    style={{
                        borderColor: 'rgba(0,0,0,0)',
                        color: this.props.theme === "light" ? "#797979" : "#9e9e9e"
                    }}
                    >
                        
                        <p className="audioLangText"
                            style={{
                                backgroundColor:this.props.theme === "light" ? "white" : "black",
                                color:this.props.theme === "light" ? "black" : "white"
                            }}
                        >
                            {this.languageMaker(index,(index+1))}
                        </p>
                    </div>
                    
                    {data}
                    <div className="labelHolder"
                    data-label={(index + 1)}
                    onMouseOver={this.changeChannel}
                    >
                    </div>
                </div>
            )
        }
        return (
            <div id="audioBars" className={'t'+general}>
                    {con}
                </div>
        )
    }
    channelClear = () =>{
        this.setState({
            hoverChannel:''
        })
    }
}
export default AudioVisualizer