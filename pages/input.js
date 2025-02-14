import styles from '../styles/input.module.css';

import React from 'react';
import TaskCategoryList from "../components/taskCategoryList";
import ResultTabComponent from '../components/resultTabComponent';
import InputItem from '../components/inputItem';
import  Tab from '@mui/material/Tab';
import  Tabs from '@mui/material/Tabs';
import { Box } from '@mui/material';
import { useState } from 'react';

import { DateTime } from 'luxon';

import constants from "../src/constants";

import makeAliceBobUtility from "../src/mainAlgorithm";
import AllocationList from 'components/allocationList';

import GuideTalk from 'components/guideTalk';

// TabPanel -> https://mui.com/material-ui/react-tabs/
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={ value !== index }
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            { ...other }
        >
            {
                value === index && (
                    <Box sx={{width: '100%'}}>
                        { children }
                    </Box>
                )
            }
        </div>
    )
}
const allTasks = constants.allTasks



export default function InputPage() {

    const [ currentTab, setCurrentTab ] = useState(0);
    const [ currentTaskRepartition, setAllTaskRepartition ] = useState(getInitialTaskRepartition());

    const getAllInputComponents = (taskArray, personKey) => {

        const returnArray = [];

        for (let category of taskArray) {
            let activeTasks = category.children.filter(task => task.checked).map((taskObject, index) => 
                <InputItem label={taskObject.name} key={ `${taskObject.name}${index}` } person={personKey}
                    onTaskChange={setTaskRepartition} initialValue={ getTaskRepartition(personKey, taskObject.name) }/>
            );
            if (activeTasks.length > 0) {
                returnArray.push(
                    <div className={ styles.categorySection } key={personKey[0] + category.name}>
                        <h2 className={ styles.categoryHeader } style={{ color: 'white' }}>{ category.name }</h2>
                        { activeTasks }
                    </div>
                );
            }
        }

        return returnArray;
    }

    // Functions regarding the task repartition state -=-=-=-=-=-=-=-
    // Creating the initial value
    function getInitialTaskRepartition() {
        const myTasks = {};
        const partnerTasks = {};

        for (let categoryObject of allTasks) {
            for (let taskObject of categoryObject.children) {
                myTasks[taskObject.name] = {
                    participates: false,
                    effort: 0,
                    duration : 10,
                    category : categoryObject.name,
                    userModified: false,
                };
                partnerTasks[taskObject.name] = {
                    participates: false,
                    effort: 0,
                    duration : 10,
                    category : categoryObject.name,
                    userModified: false,
                }
            }
        }

        return { myTasks: myTasks, partnerTasks: partnerTasks};
    }

    function getTaskRepartition(person, taskName) {
        const personKey = (person == 'me' ? 'myTasks' : 'partnerTasks');
        return currentTaskRepartition[personKey][taskName];
    }
    
    function setTaskRepartition(person, taskName, taskRepartitionItem) {
        const personKey = (person == 'me' ? 'myTasks' : 'partnerTasks');           
        
        currentTaskRepartition[personKey][taskName] = taskRepartitionItem;
        currentTaskRepartition[personKey][taskName].userModified = true;

        // "私の評価”を変更すれば、パートナーの評価も自動的に設定します（ユーザーから変更がなかった場合のみ）
        // if (person == 'me' && !currentTaskRepartition['partnerTasks'][taskName].userModified) {
        //     currentTaskRepartition['partnerTasks'][taskName].participates = !taskRepartitionItem.participates;
        // }
        if (person == 'me') {
            currentTaskRepartition['partnerTasks'][taskName].participates = !taskRepartitionItem.participates;
        }
        if (person == 'partner') {
            currentTaskRepartition['myTasks'][taskName].participates = !taskRepartitionItem.participates;
        }

        setAllTaskRepartition(currentTaskRepartition);

    }
    
    const handleChangeTasks = (event) => {
        allTasks[event.index].children[event.child.index].checked = event.child.checked;
    }

    
    //console.log(allTasks, currentTaskRepartition);
    //let [adjustedWinnerTaskRepartition, leastChangeAllocationTaskRepartition] = makeAliceBobUtility(allTasks, currentTaskRepartition);
    //console.log(adjustedWinnerTaskRepartition);
    //console.log(leastChangeAllocationTaskRepartition);
    
    // let [currentAliceAllocation, currentBobAllocation] = makeBothAllocation(currentTaskRepartition);
    // let [adjustedWinnerAliceAllocation, adjustedWinnerBobAllocation] = makeBothAllocation(adjustedWinnerTaskRepartition);
    // let [leastChangeAliceAllocation, leastChangeBobAllocation] = makeBothAllocation(leastChangeAllocationTaskRepartition);
    
    return (
        <div className={styles.inputPanel}>
            <Tabs value={currentTab} 
            sx={{ position: 'sticky', top: '10px', backgroundColor: 'white', zIndex: 50000, borderRadius: '5px' }} 
            onChange={ (_, newValue) => setCurrentTab(newValue) }
            centered
            variant="fullWidth"
            scrollButtons="auto"
            >
                <Tab label="家事選択" sx={{ backgroundColor: 'white'}} />
                <Tab label="私の評価" sx={{ backgroundColor: 'white'}}/>
                <Tab label="パートナーの評価" sx={{ backgroundColor: 'white'}}/>
                <Tab label="コンシェルジュの提案" sx={{ backgroundColor: 'white'}}/>
            </Tabs>
            
            <TabPanel value={ currentTab } index={0} sx={{ width: 1}}>
                <br/>
                <GuideTalk tabnumber={0}></GuideTalk>
                <TaskCategoryList taskTree={allTasks} onChange={handleChangeTasks}></TaskCategoryList>
            </TabPanel>
            <TabPanel value={ currentTab } index={1} sx={{ width: 1}} >
                <br/>
                <GuideTalk tabnumber={1}></GuideTalk>
                { getAllInputComponents(allTasks, 'me') }
            </TabPanel>
            <TabPanel value={ currentTab } index={2} sx={{ width: 1}}>
                <br/>
                <GuideTalk tabnumber={2}></GuideTalk>
                { getAllInputComponents(allTasks, 'partner') }
            </TabPanel>
            <TabPanel value={ currentTab } index={3} sx={{ width: 1}}>
              <ResultTabComponent
                currentTaskRepartition={ currentTaskRepartition }
                allTasks={ allTasks }
              >
              </ResultTabComponent>
            </TabPanel>
            {/* <Grid container spacing={12} justifyContent="center">
                <Grid item xs={2} justifyContent="center">
                    <Link href="/" passHref={true}><Button variant="contained" color="secondary">Cancel</Button></Link>
                </Grid>
                <Grid item xs={2} justifyContent="center">
                    <Button variant="contained" color="secondary" disabled={currentTab === 3} onClick={() => {
                        setCurrentTab(currentTab + 1)
                    }}>Next</Button>
                </Grid>
            </Grid> */}
        </div>
    );
}
