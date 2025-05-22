let grid = document.getElementById("grid");

let isMobile = window.innerWidth <=600;                    
let radius = isMobile?15:7;
let centreX = 50;
let centreY = isMobile?110:25;

document.getElementsByClassName("playpause")[0].style.top= `${centreY + 3.5*radius}vw`;
document.getElementsByClassName("playpause")[0].style.position= "absolute";

let angles = [0, 60, 120, 180, 240, 300];
let rot = [120, 180, 240, 300, 0, 60];
let labelrot = [240, 180, 120, 60, 0, 300];
let labeltran = [-120, -180, 120, 60, 0];
let labels1 = [
  [8, 8, 9, 8, 8, 9],
  [6, 5, 4, 6, 4, 5],
  [1, 1, 3, 2, 1, 2],
];
let labels2= [
    [1,0,1,0,1,0],
    [0,1,0,1,0,1]
]
let j, i;
const array = [];
for (j = 0; j < 3; j++) {
  const arr = [];
  for (i = 0; i < 6; i++) {
    plotNode(angles[i], i, j, arr);
  }
  array.push(arr);
}
for (j = 0; j < 3; j++) {
  for (i = 0; i < 6; i++) {
    plotEdge(rot, i, j, array);
  }
}

function plotNode(angle, i, j, arr) {
  r = radius * (j + 1);
  let x = centreX + r * Math.cos((angle * Math.PI) / 180);
  let y = centreY + r * Math.sin((angle * Math.PI) / 180);
  const node = document.createElement("button");
  node.className = "node";
  node.id = `${Math.floor(j + 1)}${Math.floor(i + 1)}`;
  node.style.left = `${x}vw`;
  node.style.top = `${y}vw`;
  isMobile?"":node.style.transform = "translate(100%, 100%)"; 
  grid.appendChild(node);
  arr.push([x, y]);
}
function plotEdge(rot, i, j, array) {
  const edge = document.createElement("div");
  edge.className = "edge";
  edge.style.width = `${radius * (j + 1)}vw`;
  edge.style.left = `${array[j][i][0] + 3.5}vw`;
  edge.style.top = `${array[j][i][1] + 3.5}vw`;
  edge.style.transform = `rotate(${rot[i]}deg)`;

//label

  const label = document.createElement("p");
  label.innerHTML = `${labels1[j][i]}`;
  label.style.transform = `translate(${(radius * (j + 1)) / 2}vw, -50%) rotate(${-rot[i]}deg)`;
  label.className = "label";
  edge.appendChild(label);
  grid.appendChild(edge);
  if (j == 0) {
    for (k = 0; k <= 5; k += 2) {
      const edge = document.createElement("div");
      const label = document.createElement("p");
      edge.className = "edge";
      edge.style.width = `${radius}vw`;
      edge.style.left = `${array[0][k][0] + 3.5}vw`;
      edge.style.top = `${array[0][k][1] + 3.5}vw`;
      edge.style.transform = `rotate(${angles[k]}deg)`;
      label.innerHTML = `${labels2[j][k]}`;
      label.style.transform = `translate(${radius / 2}vw, -50%) rotate(${-angles[k]}deg)`;
      label.className = "label";
      edge.appendChild(label);
      grid.appendChild(edge);
    }
  } else if (j == 1) {
    for (k = 1; k <= 5; k += 2) {
      const edge = document.createElement("div");
      const label = document.createElement("p");
      edge.className = "edge";
      edge.style.width = `${radius}vw`;
      edge.style.left = `${array[1][k][0] + 3.5}vw`;
      edge.style.top = `${array[1][k][1] + 3.5}vw`;
      edge.style.transform = `rotate(${angles[k]}deg)`;
      label.innerHTML = `${labels2[j][k]}`;
      label.style.transform = `translate(${radius / 2}vw, -50%) rotate(${-angles[k]}deg)`;
      label.className = "label";
      edge.appendChild(label);
      grid.appendChild(edge);
    }
  }
}

//extra edges
