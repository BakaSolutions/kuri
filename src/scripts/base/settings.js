const settings = {
	wrapper: sel(["[data-tab=basicSettings]"]),

  storage: new Storage({
    defaults: {
      settings: {
        "USEAJAX": true,
        //	"UNSPTXT": true,
        //	"UNSPPCS": true,
        "SHANIMA": true,
      }
    }
  }),

	init: function() {
		settings.addOption("USEAJAX", "Использовать AJAX")
		// settings.addOption("UNSPTXT", "Раскрывать спойлеры", false)
		// settings.addOption("UNSPPCS", "Раскрывать картнки под спойлерами", false)
		settings.addOption("SHANIMA", "Показывать анимации")

    INITIALIZED_SCRIPTS.push("settings")
	},

	addOption: function(id, description) {
		let node = document.createElement("label");
    let input = document.createElement("input");

		node.innerText = description;
    input.id = id;

    let value = settings.storage.get(`settings.${id}`);

		switch (typeof value) {
			case "boolean":
        input.type = "checkbox";
        input.classList.add("switch");
        input.checked = value;

        let toggle = node.cloneNode();
        toggle.setAttribute('for', id);
        toggle.classList.add("switch");

        let span = document.createElement("span");
        toggle.appendChild(span);
        node.appendChild(input);
        node.appendChild(toggle);
				break;
			//case "string":
			default:
        input.type = "text";
        input.value = value;
        node.appendChild(input);
				break;
    }

		settings.wrapper.appendChild(node);
	},

	setOption: function(id, value) {
    settings.storage.set(`settings.${id}`, value);

		switch (id) {
			case "SHANIMA":
				document.documentElement.style.setProperty("--animationDuration", value ? ".3s" : "0s")
				break;
		}
	},

	toggleOption: function(target, id) {
		let isCheckbox = typeof target.checked === "boolean" && target.value === "on";
		settings.setOption(id, isCheckbox ? target.checked : target.value);
	}
};

document.documentElement.style.setProperty("--animationDuration", settings.storage.get('settings.SHANIMA') ? ".3s" : "0s")
// TODO: Cut all init functions into a separate function
