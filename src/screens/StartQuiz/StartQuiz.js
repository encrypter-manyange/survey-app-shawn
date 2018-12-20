import React, { Component } from 'react';
import Header from '../../components/Header/Header'
// import lightBlue from '@material-ui/core/colors/lightBlue';

import Button from '@material-ui/core/Button';
import NavigateNext from '@material-ui/icons/NavigateNext';

import SentimentSatisfied from '@material-ui/icons/SentimentSatisfiedRounded';
import SentimentVerySatisfied from '@material-ui/icons/SentimentVerySatisfiedRounded';
import SentimentDissatisfied from '@material-ui/icons/SentimentDissatisfiedRounded';
import SentimentVeryDissatisfied from '@material-ui/icons/SentimentVeryDissatisfiedRounded';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import CircularProgress from '@material-ui/core/CircularProgress';

import Typography from '@material-ui/core/Typography';
import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAAVqCls4vgcdHTBrN2wBLVuaFhfFLQO4k",
    authDomain: "chronicle-health-app.firebaseapp.com",
    databaseURL: "https://chronicle-health-app.firebaseio.com",
    projectId: "chronicle-health-app",
    storageBucket: "chronicle-health-app.appspot.com",
    messagingSenderId: "714488781454"
};
firebase.initializeApp(config);


class QuizList extends Component {
  constructor() {
    super()

    this.state = {

      radioVal: null,

      sec: 30,
      min: 0,
        correctpos:0,
      correct: 0,
        whichcorrect: [],
      scored: false,

      similey: null,
      quizid: null,

    }
    this.handleChange = this.handleChange.bind(this);
    this.quizTimer = this.quizTimer.bind(this);
    this.timer()
  }

  handleChange(e) {
    this.setState({
      radioVal: e.target.value
    });
  }

  async updating() {
    const { started, qstnNo, onPress } = this.props;
    const { correct, radioVal,whichcorrect } = this.state;

    // var radio = document.querySelector("input[name='option']:checked");

    if (radioVal == null) {
      alert('Selection Required');
    }

    else {
      if ((qstnNo === started.qArr.length - 1) && (started.qArr[qstnNo].answer.match(radioVal))) {

        await this.setState({
            correct: correct + 1,
          min: 0,
          sec: 0
        });
         //alert(this.state.whichcorrect);
      }
      else
        if ((qstnNo === started.qArr.length - 1) && !(started.qArr[qstnNo].answer.match(radioVal))) {

          await this.setState({
              whichcorrect:[...this.state.whichcorrect, qstnNo],
              min: 0,
            sec: 0
          })

        }
        else
          if (!(qstnNo === started.qArr.length - 1) && (started.qArr[qstnNo].answer.match(radioVal))) {

            await this.setState({
                correct: correct + 1,
                radioVal: null,
            });
             // alert(this.state.whichcorrect);

            onPress(qstnNo);
          }
          else {
            await this.setState({
                whichcorrect:[...this.state.whichcorrect, qstnNo],
                radioVal: null,
            })
            onPress(qstnNo);
          }
    }
  }

  async scoreCal() {
    const { started } = this.props;
    const { correct } = this.state;

    await this.setState({
      scored: ((correct) * (100 / started.qArr.length)).toFixed(2),
      date: new Date(),
    })

    this.saveScore();
    // localStorage.setItem("score", JSON.stringify(score))
  }

  saveScore() {
    const { started,subQuizID } = this.props;
    const { scored, date } = this.state;

    started.score = scored;
    started.attemptDate = date.toLocaleDateString();
    started.attemptTime = date.toLocaleTimeString();
      const db = firebase.firestore();

      db.collection("quizresults").add({
          score: scored,
          quiz: subQuizID,
      })
          .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
              console.error("Error adding document: ", error);
          });

    if (scored == 100) {
      this.setState({
        similey: <SentimentVerySatisfied className="similey" color="disabled" />
      })
    }
    else
      if (scored == 0) {
        this.setState({
          similey: <SentimentVeryDissatisfied className="similey" color="disabled" />
        })
      }
      else
        if (scored >= 60) {
          this.setState({
            similey: <SentimentSatisfied className="similey" color="disabled" />
          })
        }
        else
          if (scored < 60 && scored > 0) {
            this.setState({
              similey: <SentimentDissatisfied className="similey" color="disabled" />
            })
          }

  }

  quizTimer() {
    const { sec, min } = this.state;

    if ((sec === 0) && (min === 0)) {

      clearInterval(this.time);

      this.scoreCal();

    }

    else
      if ((sec <= 0) && !(min === 0)) {

        this.setState({
          sec: 59,
          min: min - 1,
        })
      }

      else {
        this.setState({
          sec: sec - 1,
        })
      }

  }

  timer() {
    this.time = setInterval(this.quizTimer, 1000);
  }

  render() {
    const { started, qstnNo, back, quizName, subQuizName, logout,subQuizID } = this.props;
    const { correct, scored, min, sec, whichcorrect } = this.state;
    return (
      <div style={{ margin: '80px 3% 3% 3%' }}>


        {scored !== false ?

          <div>
            <Header logout={logout} />


            <div className='resultDiv'>
                <Typography variant="display1" >
                    {quizName}:<br/>{subQuizName}
                </Typography>
                <br />

              <div >
                <br />
                <br />
               <div style={{ position: 'relative' }}>
                   <CircularProgress size={200} thickness={2} variant="static" value={scored} />
                {this.state.similey}
                <Typography variant="headline" >
                  {scored} %
                </Typography>
               </div>
                <br />
                <Typography variant="subheading" >
                  Total Questions: {started.qArr.length}
                </Typography>
                <Typography variant="subheading" >
                  Correct: {correct}
                </Typography>


              </div>
                <div>
                    {whichcorrect.length > 0 &&
                    <b>Below are the answeres to the questions you got wrong.</b>}
                    <ul style={{ listStyle: 'none' }}>
                        {whichcorrect.length > 0 && whichcorrect.map((a,c)=> {
                            var answeris = "";
                            if(started.qArr[c].answer.match('1')){
                                answeris = started.qArr[c].option1;
                            }else if(started.qArr[c].answer.match('2')){
                                answeris = started.qArr[c].option2;

                            }else if(started.qArr[c].answer.match('3')){
                                answeris = started.qArr[c].option3;

                            }else if(started.qArr[c].answer.match('4')){
                                answeris = started.qArr[c].option4;
                            }
                            return (<li><b>{c+1}) {started.qArr[c].question}</b><br/>{answeris}</li>);
                        })}
                    </ul>
                </div>
              <Button className="backBtn" size='large' variant="contained" color="primary" onClick={() => back()}>
                back
              </Button>
           </div>
          </div>
          :
          <div>
            <Header /> 
            <Typography variant="title" >
              {min}:{sec}
            </Typography>
            <br/>
            <div className='qstnDiv'>



              <FormControl component="fieldset" style={{ margin: '15px 15px 30px 15px' }}>

                <h3>{qstnNo + 1}. {started.qArr[qstnNo].question}</h3>
                {/* <FormLabel component="legend">Gender</FormLabel> */}
                <RadioGroup
                  // aria-label="Gender"
                  // name="gender1"
                  // className={classes.group}
                  value={this.state.radioVal}
                  onChange={this.handleChange}
                >

                  <FormControlLabel value="1" name="option" control={<Radio />} label={started.qArr[qstnNo].option1} />
                  <FormControlLabel value="2" name="option" control={<Radio />} label={started.qArr[qstnNo].option2} />
                  <FormControlLabel value="3" name="option" control={<Radio />} label={started.qArr[qstnNo].option3} />
                  <FormControlLabel value="4" name="option" control={<Radio />} label={started.qArr[qstnNo].option4} />

                </RadioGroup>

              </FormControl>

            </div>

            <Button className="nextBtn" variant="fab" color="primary" onClick={this.updating.bind(this)}>
              <NavigateNext />
            </Button>
          </div>

        }

      </div>
    )
  }

}

export default QuizList;

//CHILD --> PARENT STATE UPDATE
//=============================

//1) Create a function in Parent that
//will update the State.

//2) Pass the function in the Child's
//Component's Props

//3) Call that function from Child Props.
