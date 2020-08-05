/*
    Visualisation inspired by old oscilloscopes and mozilla MDN example
    http://radiorocket.ch
*/

function OscVisualization(){

    /*
        Sets the ID and Name of the visualization.
    */
    this.id = 'osc';
    this.name = 'Oscillator';

    /*
        Initializes the analyser for the visualization.
    */
    this.analyser = '';

    /*
        Initializes the container and preferences.
    */
    this.container = '';

    this.preferences = {
        color: [ 0, 0, 0 ],
        back_color: [ 255, 255, 255 ],
        time_base: 0.5,
        thickness: 5,
        x_offset: 0,
        y_offset: 0,
        trails: 0.05,
        compose: 'multiply',
        amplification: 0.5
    }

    /*
        Initializes the drawing context
    */
    this.ctx = '';

        /*
        Initializes the refernce canvas
    */
    this.canvas = '';

    /*
        Initializes the animation frames.
    */
    this.requestAnimation = '';

    /*
        Initializes the array of audio samples
    */
    this.freqByteData = '';

    /**
     * Returns the name of the visualization.
     */
    this.getName = function(){
        return name;
    }

    /**
     * Returns the id of the visualization.
     */
    this.getID = function(){
        return this.id;
    }

    /**
     * Sets the user defined preferences for the visualization.
     *
     * @param {object} userPreferences  - The preferences passed in by the user for the visualization.
     */
    this.setPreferences = function( userPreferences ){
        for( var key in this.preferences ){
            if( userPreferences[ key ] != undefined) {
                this.preferences[key] = userPreferences[key];
            }
        }
    }   

    /*
        Resize the canvas and the container.

        @param {object} size  - The target size, an object with "height" or/and "width" integer property 
    */
    this.resize = function( size ){
        if('width' in size){
            this.container.style.width = size.width+"px";
            this.canvas.style.width = size.width+"px";
            this.canvas.width = size.width;
        }
        if('height' in size){
            this.container.style.height = size.height+"px";
            this.canvas.style.height = size.height+"px";
            this.canvas.height = size.height;
        }
    }

    /**
     * Starts the visualization.
     *
     * @param {Node} element  - The element we are starting the visualization with.
     */
    this.startVisualization = function( element ){
        /*
            Set the analyser to the Amplitude analyser.
        */
        this.analyser = Amplitude.getAnalyser();

        this.analyser.fftSize = 512;

        this.freqCount = this.analyser.frequencyBinCount;
        this.freqByteData = new Uint8Array( this.freqCount );

        this.container = element;

        this.canvas = document.createElement('canvas');

        this.resize({   width: this.container.offsetWidth,
                        height: this.container.offsetHeight
                    })

        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.container.appendChild( this.canvas );

        this.running = true;

        this.draw();
    }

    /**
     * Stops the visualization and clears the container.
     */
    this.stopVisualization = function(){
        //cancelAnimationFrame( this.requestAnimation );
        //window.clearInterval( this.requestAnimation );
        window.cancelAnimationFrame( this.requestAnimation );
        this.container.innerHTML = '';
        this.freqByteData = '';
    }

    /**
     * The callback that draws the visualization based on the frequency of the song.
     */
    this.draw = function(){
        this.analyser = Amplitude.getAnalyser();

        this.ctx.globalCompositeOperation = 'screen';

        //this.ctx.globalAlpha = 0.1


        this.ctx.fillStyle = `rgba(${this.preferences.back_color.join(",")}, ${this.preferences.trails})`;
        //this.ctx.drawImage(this.canvas, 20, -20);
        this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

        this.ctx.globalCompositeOperation = this.preferences.compose;

        

        //this.analyser.getByteFrequencyData( this.freqByteData );

        
        //freqByteData.length -= freqByteData.length/2
        //console.log(this.freqByteData);
        //console.log(this.freqByteData.length);

       // this.freqByteData.length = this.freqByteData.length / 2;


        this.ctx.fillStyle = this.preferences.bar_color;


        this.analyser.getByteTimeDomainData( this.freqByteData );

        let d = this.canvas.width % this.preferences.time_base;

        let numberOfBars = Math.round((this.canvas.width+d) / (this.preferences.time_base+1));

        let offsetFreq = Math.round( this.freqCount / numberOfBars );

        this.draw_osc(numberOfBars, offsetFreq);

        //this.ctx.fillStyle = `rgba(${this.preferences.back_color.join(",")}, ${1-this.preferences.trails})`;
        //this.ctx.drawImage(this.canvas, 20, -20);
        //this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );
        //this.ctx.drawImage(this.canvas, 0, 0, this.canvas.width-20, this.canvas.height-20);

        this.requestAnimation = window.requestAnimationFrame( this.draw.bind(this) );

    }

    this.draw_osc = function(numberOfBars, offsetFreq){

        this.ctx.beginPath();

        let xoffset = (this.canvas.width / this.freqCount) + this.preferences.x_offset;
        let yoffset = (this.canvas.height / 2) - ((this.canvas.height )*(1-this.preferences.amplification))
        yoffset += this.preferences.y_offset;

        for( let i = 0; i <= this.freqCount; i++ ){


            let magnitude = this.freqByteData[ Math.abs(i) ] / 128;
            /**
            if(magnitude > 1.1)
                magnitude = 2
            else
                magnitude = 0
            **/
            //magnitude *= this.canvasHeight*0.7;
            //magnitude = this.scale(magnitude, 0, 1, 0, 10);
            
            //if(i%2 == 0)
            //    magnitude *= -1;

            var x = (i*(xoffset+1));
            //var y = - * this.preferences.zoom + (this.canvasHeight * this.preferences.zoom);
            var y = -yoffset;

            y += (this.canvas.height * this.preferences.amplification) * magnitude;

            var mul = ((magnitude-0.8)*this.preferences.thickness);
            this.ctx.strokeStyle = `rgba(${this.preferences.color.join(",")}, ${2-magnitude})`;
            this.ctx.lineWidth = mul;
            //console.log(magnitude)
            this.ctx.lineTo(x, y);
            //this.ctx.lineTo(x+this.preferences.spacer_width, y);
            i+=offsetFreq;
        }

        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();

    }

    this.scale = function(num, in_min, in_max, out_min, out_max) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}

export default OscVisualization;