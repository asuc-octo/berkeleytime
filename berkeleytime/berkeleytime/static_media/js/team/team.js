if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

const base = '<div style="display: inline-block; width: 200px;" class="person-container"> \
                <div class="picture-container" style="margin: 0 auto; text-align: center; width: 150px;"> \
                    <img class="picture trigger" src="{0}"> \
                </div> \
                <div class="text-container"> \
                    <div class="name"><a href="{1}" style="color: black; font-weight: 500;">{2}</a></div> \
                    <div class="position">{3}</div>\
                    <div class="position">{4}</div> \
                </div> \
            </div>';

const base2 = '<div style="display: inline-block; width: 200px;" class="person-container"> \
                <div class="picture-container" style="margin: 0 auto; text-align: center; width: 150px;"> \
                    <img class="picture trigger" src="{0}"> \
                </div> \
                <div class="text-container"> \
                    <div class="name" style="color: black; font-weight: 500;">{1}</div> \
                    <div class="position">{2}</div>\
                    <div class="position">{3}</div> \
                </div> \
            </div>';

const curr_people = [
    ["https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAKnAAAAJDQ1ZGIzMGZkLWI0ODYtNGUwOS1hMjYyLTgxMWU2MDI1ODZiYw.jpg", "http://yuxinzhu.com/#/", "Yuxin Zhu", "Co-Founder", "<br>"],
    ["https://scontent-ort2-2.xx.fbcdn.net/v/t1.0-9/12003172_10153663459889809_1814637104134126108_n.jpg?oh=2f0abafefce675d8c39121827825ff15&oe=5A26C7BF", "http://noahgilmore.com", "Noah Gilmore", "Co-Founder", "<br>"],
    ["http://asucocto.org/img/profile/RevatiKapshikar.jpg", "https://www.linkedin.com/in/rkapshikar/", "Revati Kapshikar", "EECS, Econ 2018", "CTO"],
    [null, "Vaibhav Srikaran", "EECS 2020", "Project Manager"],
    ["http://scottjlee.github.io/img/pic1.jpg", "http://scottjlee.github.io", "Scott Lee", "CS/Stats 2019", "Lead Engineer"],
    [null, "https://www.linkedin.com/in/c2tonyc2/", "Tony Situ", "EECS 2018", "Lead Engineer"],
    [null, "Alan Rosenthal", "Compsci 2020", "Engineer"],
    [null, "https://www.linkedin.com/in/flora-zhenruo-xue/", "Flora Xue", "EECS 2019", "Engineer"],
    ["https://jemmakwak.github.io/assets/img/happy.png", "https://jemmakwak.github.io", "Jemma Kwak", "Cogsci 2020", "Designer"],
    [null, "Justin Lu", "EECS 2019", "Engineer"],
    [null, "Kate Xue", "EECS 2019", "Engineer"],
    [null, "Katherine Jiang", "Compsci 2021", "Engineer"],
    [null, "Michael Li", "EECS 2021", "Engineer"],
    [null, "Santhosh Subramanian", "Compsci 2020", "Engineer"],
    ["http://www.hantaowang.me/images/will.png", "http://www.hantaowang.me", "Will Wang", "EECS 2020", "Engineer"],
];

current = "";
for (i = 0; i < curr_people.length; i++) {
    if (curr_people[i][0] == null) {
        curr_people[i][0] = "https://i.pinimg.com/736x/d4/8f/8a/d48f8a2155f7b45a4c3d519b559d41ff--california-bears-bears-football.jpg"
    }
    if (curr_people[i].length == 5) {
        current += base.format(curr_people[i][0], curr_people[i][1], curr_people[i][2], curr_people[i][3], curr_people[i][4]);
    } else {
        current += base2.format(curr_people[i][0], curr_people[i][1], curr_people[i][2], curr_people[i][3]);
    }
}

document.getElementById("team-members").innerHTML= current;

const past_people = [
    ["Laura Harker"],
    ["Kimya Khoshnan"],
    ["https://www.linkedin.com/in/cwang395/", "Christine Wang"],
    ["http://erichuynhing.com", "Eric Huynh"],
    ["Jennifer Yu"],
    ["Parsa Attari"],
    ["https://www.linkedin.com/in/iyengararvind/", "Arvind Iyengar"],
    ["https://www.linkedin.com/in/kelvinjleong/", "Kelvin Leong"],
    ["https://github.com/kevjiangba", "Kevin Jiang"],
    ["Sandy Zhang"],
    ["Ashwin Iyengar"],
    ["Emily Chen"],
    ["Niraj Amalkanti"],
    ["Sanchit Bareja"],
    ["Ronald Lee"],
    ["Mihir Patil"],
    ["<br>", "<br>", "<br>"],
    ["<br>", "<br>", "<br>"],
    ["<br>", "<br>", "<br>"],
    ["<br>", "<br>", "<br>"],
];

const base3 = '<div style="display: inline-block; width: 200px; height: 40px; line-height: 40px;"> \
                <a href="{0}" style="color: black">{1}</a> \
            </div>';

const base4 = '<div style="display: inline-block; width: 200px; height: 40px; line-height: 40px;" > \
                {0} \
            </div>';

past = ""
for (i = 0; i < past_people.length; i++) {
    if (past_people[i].length == 1) {
        past += base4.format(past_people[i][0]);
    } else {
        past += base3.format(past_people[i][0], past_people[i][1]);
    }
}

document.getElementById("past-members").innerHTML= past;
