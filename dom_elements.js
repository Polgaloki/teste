import { draw_infostructure_lines } from "./draw.js"
import { API_HOST } from "./host_envs.js";

// FILE FOR OPERATIONS REGARDING DOM ELEMENTS

function read_files(limiter, olt, map){
    document.getElementById("file_container").style.display = "none"
    let data = new FormData();
    const input = document.getElementById("file_entry");
    data.append("rede", input.files[0]);
    data.append("limiter", JSON.stringify(limiter))
    data.append("OLT", JSON.stringify(olt))

    let map_div = document.getElementById("map")
    let map_container = document.getElementById("map-container")
    
    var loading = document.createElement('div')
    loading.className = 'loading-animation'

    map_container.removeChild(map_div)
    map_container.appendChild(loading)

    fetch(API_HOST + "/upload_csv/", {method: "POST", credentials: "include", body: data, header: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',},
    })
    .then(response => {
        map_container.removeChild(loading)
        map_container.appendChild(map_div)
        response.json().then(response_data => {
            const paths = response_data.drawablePaths
            draw_infostructure_lines(paths, map)
        })
    })
}


function handle_limit_click(){
    let new_limit = prompt("new limit")
    if (new_limit === null || new_limit === ""){
        return
    }
    document.getElementById("limit").innerText = new_limit
}


function get_limit(){
    const limit_obj = document.getElementById("limit")
    return parseFloat(limit_obj.innerText)
}

let mode = "CUT"
function get_mode(){
    return mode
}


function set_mode(new_mode){
    mode = new_mode.toUpperCase()
    if (!["BRANCH", "CUT"].includes(mode)){
        mode = "BRANCH"
    }
}

function show_download_button(){
    const dowload_button = document.getElementById("download");
    dowload_button.style.display = "flex"
}


function hide_download_button(){
    const dowload_button = document.getElementById("download");
    dowload_button.style.display = "flex"
}


async function fill_selects(){

    function pretify_json(obj) {
        let r_str = "";
        for (const prop in obj) {
            r_str = r_str.concat(prop.concat(": ".concat(obj[prop] + " | ")));
        }
        r_str = r_str.slice(0, -3);
        return r_str;
    }

    let select = document.getElementById("cables")
    const cables_response = await fetch(API_HOST + "/get-all-cables/")
    const json_cables = await cables_response.json()
    const cables = json_cables.cables
    
    for(let i = 0; i<cables.length; i++){
        let opt = document.createElement('option');
        opt.value = cables[i].id;
        opt.innerHTML = pretify_json(cables[i]);
        select.appendChild(opt);
    }


    select = document.getElementById("spliceboxes")
    const boxes_response = await fetch(API_HOST + "/get-all-spliceboxes/")
    const json_boxes = await boxes_response.json()
    const boxes = json_boxes.boxes
    
    for(let i = 0; i<boxes.length; i++){
        let opt = document.createElement('option');
        opt.value = boxes[i].id;
        opt.innerHTML = pretify_json(boxes[i]);
        select.appendChild(opt);
    }

    select = document.getElementById("uspliters")
    const uspliters_response = await fetch(API_HOST + "/get-all-uspliters/")
    const json_uspliters = await uspliters_response.json()
    const uspliters = json_uspliters.uspliters
    
    for(let i = 0; i<uspliters.length; i++){
        let opt = document.createElement('option');
        opt.value = uspliters[i].id;
        opt.innerHTML = pretify_json(uspliters[i]);
        select.appendChild(opt);
    }

    select = document.getElementById("bspliters")
    const bspliters_response = await fetch(API_HOST + "/get-all-bspliters/")
    const json_bspliters = await bspliters_response.json()
    const bspliters = json_bspliters.bspliters
    
    for(let i = 0; i<bspliters.length; i++){
        let opt = document.createElement('option');
        opt.value = bspliters[i].id;
        opt.innerHTML = pretify_json(bspliters[i]);
        select.appendChild(opt);
    }
}


function get_selected(){
    const selectCable = document.getElementById('cables');
    const selectedCables = Array.from(selectCable.selectedOptions).map(option => parseInt(option.value));

    const selectBox = document.getElementById('spliceboxes');
    const selectedBoxes = Array.from(selectBox.selectedOptions).map(option => parseInt(option.value));

    const selectUspliter = document.getElementById('uspliters');
    const selectedUspliters = Array.from(selectUspliter.selectedOptions).map(option => parseInt(option.value));

    const selectBspliter = document.getElementById('bspliters');
    const selectedBspliters = Array.from(selectBspliter.selectedOptions).map(option => parseInt(option.value));

    return {cable:selectedCables[0], box: selectedBoxes[0], uspliters: selectedUspliters, bspliters: selectedBspliters}
}


async function handle_new_session_click(){
    await fetch(API_HOST + "/delete-session/", {credentials: "include"})
    window.location.reload()
}

function parseFields(inputString) {
  const keyValuePairs = inputString.split(' ');

  const obj = {};
  keyValuePairs.forEach(pair => {
    const [key, value] = pair.split('=');
    obj[key.trim()] = isNaN(value) ? value.trim() : parseFloat(value);
  });

  return obj;
}



async function new_bspliter() {  
    // Capturando os valores dos campos do formulário  
    const id = document.getElementById("new_bspliter_id").value;  
    const loss = document.getElementById("new_bspliter_loss").value;  
    const split = document.getElementById("new_bspliter_split").value;  
    const cost = document.getElementById("new_bspliter_cost").value;  

    // Criando objeto a partir dos valores  
    const obj = {  
        id: parseInt(id),  
        loss: parseFloat(loss),  
        split: parseFloat(split),  
        cost: parseFloat(cost)  
    };  

    // Enviando a requisição para o servidor  
    const response = await fetch(API_HOST + "/add-bspliter/", {  
        method: "POST",  
        headers: {  
            'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(obj)  
    });  

    // Tratando a resposta  
    if (response.status !== 200) {  
        alert("Error while adding: " + await response.json());  
    } else {  
        // Adicionando a nova opção ao select  
        const select = document.getElementById("bspliters");  
        const option = document.createElement("option");  
        option.value = obj.id;  
        option.textContent = `ID: ${obj.id}, Loss: ${obj.loss}, Split: ${obj.split}, Cost: ${obj.cost}`;  
        select.appendChild(option);  

        // Limpar campos após adicionar  
        document.getElementById("new_bspliter_id").value = '';  
        document.getElementById("new_bspliter_loss").value = '';  
        document.getElementById("new_bspliter_split").value = '';  
        document.getElementById("new_bspliter_cost").value = '';  
    }  
}  

async function new_cable() {  
    // Capturando os valores dos campos do formulário  
    const id = document.getElementById("new_cable_id").value;  
    const cost = document.getElementById("new_cable_cost").value;  
    const attenuation = document.getElementById("new_cable_attenuation").value;  

    // Criando objeto a partir dos valores  
    const obj = {  
        id: parseInt(id),  
        cost: parseFloat(cost),  
        attenuation: parseFloat(attenuation)  
    };  

    // Enviando a requisição para o servidor  
    const response = await fetch(API_HOST + "/add-cable/", {  
        method: "POST",  
        headers: {  
            'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(obj)  
    });  

    // Tratando a resposta  
    if (response.status !== 200) {  
        alert("Error while adding: " + await response.json());  
    } else {  
        // Adicionando a nova opção ao select  
        const select = document.getElementById("cables");  
        const option = document.createElement("option");  
        option.value = obj.id;  
        option.textContent = `ID: ${obj.id}, Cost: ${obj.cost}, Attenuation: ${obj.attenuation}`;  
        select.appendChild(option);  

        // Limpar campos após adicionar  
        document.getElementById("new_cable_id").value = '';  
        document.getElementById("new_cable_cost").value = '';  
        document.getElementById("new_cable_attenuation").value = '';  
    }  
}  

async function new_uspliter() {  
    // Capturando os valores dos campos do formulário  
    const id = document.getElementById("new_uspliter_id").value;  
    const loss1 = document.getElementById("new_uspliter_loss1").value;  
    const loss2 = document.getElementById("new_uspliter_loss2").value;  
    const cost = document.getElementById("new_uspliter_cost").value;  

    // Criando objeto a partir dos valores  
    const obj = {  
        id: parseInt(id),  
        loss1: parseFloat(loss1),  
        loss2: parseFloat(loss2),  
        cost: parseFloat(cost)  
    };  

    // Enviando a requisição para o servidor  
    const response = await fetch(API_HOST + "/add-uspliter/", {  
        method: "POST",  
        headers: {  
            'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(obj)  
    });  

    // Tratando a resposta  
    if (response.status !== 200) {  
        alert("Error while adding: " + await response.json());  
    } else {  
        // Adicionando a nova opção ao select  
        const select = document.getElementById("uspliters");  
        const option = document.createElement("option");  
        option.value = obj.id;  
        option.textContent = `ID: ${obj.id}, Loss1: ${obj.loss1}, Loss2: ${obj.loss2}, Cost: ${obj.cost}`;  
        select.appendChild(option);  

        // Limpar campos após adicionar  
        document.getElementById("new_uspliter_id").value = '';  
        document.getElementById("new_uspliter_loss1").value = '';  
        document.getElementById("new_uspliter_loss2").value = '';  
        document.getElementById("new_uspliter_cost").value = '';  
    }  
}  

async function new_splicebox() {  
    // Capturando os valores dos campos do formulário  
    const id = document.getElementById("new_splicebox_id").value;  
    const cost = document.getElementById("new_splicebox_cost").value;  
    const attenuation = document.getElementById("new_splicebox_attenuation").value;  

    // Criando objeto a partir dos valores  
    const obj = {  
        id: parseInt(id),  
        cost: parseFloat(cost),  
        attenuation: parseFloat(attenuation)  
    };  

    // Enviando a requisição para o servidor  
    const response = await fetch(API_HOST + "/add-splicebox/", {  
        method: "POST",  
        headers: {  
            'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(obj)  
    });  

    // Tratando a resposta  
    if (response.status !== 200) {  
        alert("Error while adding: " + await response.json());  
    } else {  
        // Adicionando a nova opção ao select  
        const select = document.getElementById("spliceboxes");  
        const option = document.createElement("option");  
        option.value = obj.id;  
        option.textContent = `ID: ${obj.id}, Cost: ${obj.cost}, Attenuation: ${obj.attenuation}`;  
        select.appendChild(option);  

        // Limpar campos após adicionar  
        document.getElementById("new_splicebox_id").value = '';  
        document.getElementById("new_splicebox_cost").value = '';  
        document.getElementById("new_splicebox_attenuation").value = '';  
    }  
}  

// Exportando funções globais  
window.new_splicebox = new_splicebox;  
window.new_cable = new_cable;  
window.new_uspliter = new_uspliter;  
window.new_bspliter = new_bspliter;  
// Caso haja outras funções a serem exportadas, como as de limite, mantenha as mencionadas  
export { get_limit, get_mode, set_mode, show_download_button, hide_download_button, get_selected, read_files, fill_selects };
