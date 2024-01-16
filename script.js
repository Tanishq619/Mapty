'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class WorkOut{

     d1=new Date()
     id=Date.now().toString().slice(-10)

    constructor(coords,distance,duration){
        this.coords=coords
        this.duration=duration
        this.distance=distance
    }


}

class Running extends WorkOut{
    type="running"
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence=cadence
        this.calcPace()
        this.description=` ${this.type[0].toUpperCase()+this.type.slice(1)} on ${months[this.d1.getMonth()]} ${this.d1.getDate()}`
    }



    calcPace(){
        this.pace=this.duration/this.distance
        return this.pace
    }
}

class Cycling extends WorkOut{
    type="cycling"
    constructor(coords,distance,duration,elevationGain){
        super(coords,distance,duration)
        this.elevationGain=elevationGain
        this.calcSpeed()
        this.description=`${this.type} on ${months[this.d1.getMonth()]} ${this.d1.getDate()}`
    }

    calcSpeed(){
        this.speed=this.distance/this.duration
        return this.speed
    }
}

// const r1=new Running([20,-9],23,23,43)
// const c1=new Cycling([20,-9],23,23,43)

// console.log(r1,c1);

///////////////////////////////////////////////////////////////////

class App{

    #map;
    #mapEvent;

    #workOut=[]

    constructor(){
        this._getPosition()

        form.addEventListener('submit',this._newWorkOut.bind(this) )

        inputType.addEventListener('change',this._toggleElevationField.bind(this))

        containerWorkouts.addEventListener('click',this._setView.bind(this))

        this._getLocalStorage()
    }

    _getPosition(){
        if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this))
    }
    }
    _loadMap(position){
       
    
            const {longitude}=position.coords
                const {latitude}=position.coords
            
            const coords=[latitude,longitude]
            
            const mapLink=`https://www.google.com/maps/@${latitude},${longitude},15z?entry=ttu`
            console.log(mapLink);
             this.#map = L.map('map').setView(coords, 13);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.fr/hot//copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            
            L.marker(coords).addTo(this.#map)
                .bindPopup('Current Location')
                .openPopup();


                this.#map.on('click',this._showForm.bind(this))

                this.#workOut.forEach(work=>{

                L.marker(work.coords).addTo(this.#map)
                .bindPopup(L.popup({
                    maxWidth:250,
                    minWidth:50,
                    autoClose:false,
                    closeOnClick:false,
                    className:`${work.type}-popup`
                   
                })). setPopupContent(`${work.description}`)
                .openPopup();
            })
                  
              
                
        }

        _setView(e){
            const workoutEl=e.target.closest('.workout')

            if(!workoutEl) return

           

            const workout2=this.#workOut.find(el=>el.id===workoutEl.dataset.id)

            this.#map.setView(workout2.coords,13,{
                animate:true,
              pan:{ duration:1} 
            })

        }

        _renderWorkOut(workout){
            
            let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${workout.type==="Running" ? '🏃‍♂️' : '🚴‍♀️' }</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
            

            `

            if(workout.type==='running'){

                html+= `<div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
              </div>
            </li>

            `
            }

            else if(workout.type==="cycling"){
              html+=  ` <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed}</span>
                <span class="workout__unit">km/h</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
              </div>
            </li> -->`
            }


            form.insertAdjacentHTML('afterend',html)

        }


        _hideForm(){

            inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value=""
            form.style.display="none"
            form.classList.add('hidden')
            form.style.display='grid'
        }

    _showForm(mapE){

        this.#mapEvent=mapE
                
        form.classList.remove('hidden')
    }
    _toggleElevationField(){

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }
    _newWorkOut(e){

        e.preventDefault()
        const {lat,lng}=this.#mapEvent.latlng
        console.log(lat,lng);
        
        let workout1;

        const isValid=(...inputs)=>inputs.every(inp=>Number.isFinite(inp))
        const isPositive=(...inputs)=>inputs.every(inp=>inp>=0)

        const type=inputType.value
        const distance= +inputDistance.value
        const duration= +inputDuration.value
        console.log(type,distance,duration);

        if(type==='running'){


            const cadence= +inputCadence.value

            if(!isValid(distance,duration,cadence) || !isPositive(distance,duration,cadence)) return alert('Please enter a valid input')

             workout1= new Running([lat,lng],distance,duration,cadence)
        }
    
        
        if(type==='cycling'){
            const elevation=+inputElevation.value

            if(!isValid(distance,duration,elevation) || !isPositive(distance,duration,elevation)) return alert('Please enter a valid input')
    
     workout1=new Cycling([lat,lng],distance,duration,elevation)
    
    
        }

        this.#workOut.push(workout1)
        console.log(workout1);

        this._setLocalStorage()

        this._renderWorkOut(workout1)

       
       
    

        
        L.marker(workout1.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth:250,
            minWidth:50,
            autoClose:false,
            closeOnClick:false,
            className:`${workout1.type}-popup`
           
        })). setPopupContent(`${workout1.description}`)
        .openPopup();

        this._hideForm()
       
   
      
    }

    _setLocalStorage(){
       localStorage.setItem("workouts",JSON.stringify(this.#workOut))
    }


    _getLocalStorage(){
      const data= JSON.parse(localStorage.getItem('workouts'))

      if(!data) return
      

      this.#workOut=data
      console.log(data);

      this.#workOut.forEach(work=>
        
        this._renderWorkOut(work))
    }


    _newSession(){
        localStorage.removeItem('workouts')
        location.reload()
    }
    

   


}


const app1=new App()

// navigator.geolocation.getCurrentPosition(function(position){
    
// const {longitude}=position.coords
//     const {latitude}=position.coords

// const coords=[latitude,longitude]

// const mapLink=`https://www.google.com/maps/@${latitude},${longitude},15z?entry=ttu`
// console.log(mapLink);
//  map = L.map('map').setView(coords, 13);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.fr/hot//copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// L.marker(coords).addTo(map)
//     .bindPopup('Current Location')
//     .openPopup();



    // console.log(mapEvent);

    // const {lat,lng}=mapEvent.latlng

    // L.marker([lat,lng]).addTo(map)
    // .bindPopup(L.popup({
    //     maxWidth:250,
    //     minWidth:50,
    //     autoClose:false,
    //     closeOnClick:false,
    //     className:"running-popup"
       
    // })). setPopupContent("WorkOut")
    // .openPopup();




// form.addEventListener('submit',function(e) {
    

//     //  console.log(mapEvent);
//     e.preventDefault()
//     const {lat,lng}=mapEvent.latlng
//     console.log(lat,lng);

//     L.marker([lat,lng]).addTo(map)
//     .bindPopup(L.popup({
//         maxWidth:250,
//         minWidth:50,
//         autoClose:false,
//         closeOnClick:false,
//         className:"running-popup"
       
//     })). setPopupContent("WorkOut")
//     .openPopup();
//     inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value=""
// })


// inputType.addEventListener('change',function(){
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

// })