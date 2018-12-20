import React, { Component } from 'react';
import Login from './screens/Login/Login'
import Signup from './screens/Signup/Signup'
import QuizList from './screens/QuizList/QuizList'
import QuizInfo from './screens/QuizInfo/QuizInfo'
import StartQuiz from './screens/StartQuiz/StartQuiz'
import './App.css';
import firebase from 'firebase';

import 'typeface-roboto'


class App extends Component {
    constructor() {
        super()


        const db = firebase.firestore();

        db.settings({
            timestampsInSnapshots: true
        });

        console.log("GOOOO!");

        var alldata = [];


        db.collection("quizcats").get().then( async (querySnapshot) => {


            querySnapshot.forEach(async (doc) => {
                console.log(`${doc.id} => ${doc.data().name}`);
                var newdata = {};
                // newdata.qid = doc.id;
                newdata.name = doc.data().title;
                newdata.image = doc.data().image;
                newdata.description = doc.data().desc;

              let querySnapshot_qzs = await db.collection("quizes").where('quiz', '==', doc.id).get();
                     querySnapshot_qzs.forEach(async (doc) => {
                        console.log(`Quiz found ${doc.id} => ${doc.data().title}`);
                        var newdata_sub = {name: doc.data().title, questions: '0', time: '30 sec', score: false};
                        newdata.subQuiz = [];
                         newdata_sub.quizid = doc.id;
                         newdata_sub.questionscount = 0;
                       let querySnapshot_qs = await  db.collection("questions").where('quiz', '==', doc.id).get();
                         newdata_sub.qArr = [];
                               querySnapshot_qs.forEach((doc) => {
                                console.log(`Quiz Ans found ${doc.id} => ${doc.data().title}`);
                               // var newdata_sub = {name: doc.data().title, questions: '3', time: '30 sec', score: false};
                               // newdata_sub.subQuiz = [];
                                //newdata.subQuiz.push(newdata_sub);
                                   newdata_sub.questionscount ++;
                                   newdata_sub.questions = newdata_sub.questionscount+'';


                                newdata_sub.qArr.push({
                                    question: doc.data().title,
                                    option1: doc.data().a1,
                                    option2: doc.data().a2,
                                    option3: doc.data().a3,
                                    option4: doc.data().a4,
                                    answer: doc.data().correct+''
                                });
                                   this.setState({
                                       quizzes: alldata,
                                   });
                            });

                        newdata.subQuiz.push(newdata_sub);
                         this.setState({
                             quizzes: alldata,

                         });
                    });

                alldata.push(newdata);

                this.setState({
                    quizzes: alldata,

                });
            });



          //  this.state.quizzes = alldata;


            this.setState({
                quizzes: alldata,

            });
            console.log(`Quiz Ans found REFRESHED`);


        });



        this.state = {
            quizzes: [


            ],

            /*        quizzes: [

                        {
                            name: 'Child Birth',
                            image: require("./images/preg.jpg") ,
                            description:'Quizzes about child birth',
                        },

                    ],
                    */
          //  quizzes:alldata,
            quizIndex: null,
            subQuizIndex: null,

            qstnNo: 0,

            validFlag: false,
            userFlag: true,

            userName: '',
            userEmail: '',
            userPass: '',
            loginEmail: '',
            loginPass: '',

            user: localStorage.getItem("user"),

        };

        // this.userAvailable = this.userAvailable.bind(this)
        this.updateTextdata();




        this.updateText = this.updateText.bind(this)
        this.showSignup = this.showSignup.bind(this)
        this.showLogin = this.showLogin.bind(this)
        this.checkValidation = this.checkValidation.bind(this)

        this.joinQuiz = this.joinQuiz.bind(this);
        this.showList = this.showList.bind(this);
        this.startQuiz = this.startQuiz.bind(this);
        this.nextQstn = this.nextQstn.bind(this);
        this.back = this.back.bind(this);

        this.logout = this.logout.bind(this);


    }


    async updateTextdata() {
        // console.log(e.target.name)
        // console.log(e.target.value)



        localStorage.setItem('userName', "yazyaz.com")


        localStorage.setItem('userEmail', "yaz@yaz.com")

        localStorage.setItem('userPass', "yaz@yaz.com")

        this.setState({
            loginEmail: "yaz@yaz.com"
        })
        this.setState({
            loginPass: "yaz@yaz.com"
        })

        await this.setState({
            validFlag: true,
            user: true,
        })
        localStorage.setItem('user', 'true')

    }




    async updateText(e) {
        // console.log(e.target.name)
        // console.log(e.target.value)
        const name = e.target.name;
        const value = e.target.value;

        if (name.match('name')) {
            await this.setState({
                userName: value
            })
            localStorage.setItem('userName', this.state.userName)
        }
        else if (name.match('userEmail')) {
            await this.setState({
                userEmail: value
            })
            localStorage.setItem('userEmail', this.state.userEmail)
        }
        else if (name.match('userPassword')) {
            await this.setState({
                userPass: value
            })
            localStorage.setItem('userPass', this.state.userPass)
        }
        else if (name.match('loginEmail')) {
            await this.setState({
                loginEmail: value
            })
        }
        else if (name.match('loginPass')) {
            await this.setState({
                loginPass: value
            })
        }
    }

    showSignup() {
        this.setState({
            userFlag: false,
            loginEmail: '',
            loginPass: ''
        })
    }

    showLogin() {
        const {userEmail, userPass} = this.state;
        if(userEmail == ''  || userPass == ''){
            alert('Fill all the fields');
        }
        else{
            this.setState({
                userFlag: true,
                userEmail:'',
                userPass:'',
            })
        }
    }


    async checkValidation() {
        const { loginEmail, loginPass } = this.state
        if ((loginEmail.match(localStorage.getItem('userEmail'))) && (loginPass.match(localStorage.getItem('userPass')))) {
            await this.setState({
                validFlag: true,
                user: true,
            })
            localStorage.setItem('user', 'true')
        }
        console.log("Email is Valid :", this.state.validFlag)
    }


    logout() {
        this.setState({
            // quizIndex: null,
            // subQuizIndex: null,
            user: 'false',
            // userFlag: false,
            validFlag: false,
            loginEmail: '',
            loginPass: '',
            quiz: null,
            started: null,
            qstnNo: 0,
        })
        localStorage.setItem('user', 'false')
    }

    joinQuiz(quizIndex) {
        const { quizzes } = this.state;
        this.setState({
            quiz: quizzes[quizIndex],
            quizIndex: quizIndex,
            quizName: quizzes[quizIndex].name,

        });
    }

    showList() {
        this.setState({ quiz: null });
    }

    startQuiz(subQuizIndex) {
        const { quizzes, quizIndex } = this.state;

        this.setState({
            started: quizzes[quizIndex].subQuiz[subQuizIndex],
            subQuizIndex: subQuizIndex,
            subQuizName: quizzes[quizIndex].subQuiz[subQuizIndex].name,
            subQuizID: quizzes[quizIndex].subQuiz[subQuizIndex].quizid,
        });
    }

    nextQstn(nextQstnNo) {

        this.setState({
            qstnNo: nextQstnNo + 1
        });
    }

    back() {
        this.setState({
            started: null,
            qstnNo: 0,
        });
    }


    render() {
        const { userFlag, validFlag, quizzes, quiz, started, qstnNo, quizName, subQuizName, user,subQuizID } = this.state;

        return (
            <center>
                <div>
                    {(user === 'false' || user === null) && !userFlag && <Signup updateText={this.updateText} showLogin={this.showLogin} />}
                    {(user === 'false' || user === null) && (userFlag && !validFlag) && <Login showSignup={this.showSignup} validation={this.checkValidation} updateText={this.updateText} />}
                    {(user === 'true' || (userFlag && validFlag)) && (!quiz && !started) && <QuizList list={quizzes} onPress={this.joinQuiz} logout={this.logout} />}
                    {(user === 'true' || (userFlag && validFlag)) && (quiz && !started) && <QuizInfo quiz={quiz} onPress={this.startQuiz} onBack={this.showList} logout={this.logout} />}
                    {(user === 'true' || (userFlag && validFlag)) && started && <StartQuiz quizName={quizName} subQuizName={subQuizName}  subQuizID={subQuizID} started={started} qstnNo={qstnNo} onPress={this.nextQstn} back={this.back} logout={this.logout} />}
                </div>
            </center>
        )
    }

}

export default App;