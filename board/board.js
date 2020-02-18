export class Board extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);
    this.makeBox();
    this.buildBoard();
    this._buildHitArea();
  }
  makeBox() {
    this.scene.load.image("tile", "images\tile.png");
  }

  buildBoard() {
    this.fieldGroup = new Phaser.GameObjects.Group();
    this.fieldArray = [];

    for (let i = 0; i < 4; i++) {
      this.fieldArray[i] = [];
      for (let j = 0; j < 4; j++) {
        // 100,100 -  300,100 - 500,100 - 700,100
        // 100, 300 - 200
        let field = this.scene.add.sprite(
          (j + 1) * 200 - 100,
          (i + 1) * 200 - 100,
          "tile"
        );
        field.setVisible(false);
        field.setAlpha(0);

        this.fieldGroup.add(field);

        let fieldText = this.scene.add.text(
          (j + 1) * 200 - 100,
          (i + 1) * 200 - 100,
          "3",
          {
            fontSize: 100,
            fontFamily: "Arial",
            align: "center",
            color: "#404040"
          }
        );
        fieldText.setOrigin(0.5, 0.5);
        fieldText.setVisible(false);
        fieldText.setAlpha(0);

        this.fieldGroup.add(fieldText);

        this.fieldArray[i][j] = {
          tileSprite: field,
          tileText: fieldText,
          value: 0
        };
      }
    }

    this.addRandom();
    this.addRandom();

    // this.input.keyboard.on("keyup", this.handleKey, this);
    this._buildHitArea();
  }

  // handleKey(event) {
  //   switch (event.code) {
  //     case "KeyA":
  //       console.log("A");
  //       this.handleMove(-1, 0);

  //       break;
  //     case "KeyD":
  //       console.log("D");
  //       this.handleMove(1, 0);

  //       break;
  //     case "KeyW":
  //       console.log("W");
  //       this.handleMove(0, -1);

  //       break;
  //     case "KeyS":
  //       console.log("S");
  //       this.handleMove(0, 1);

  //       break;
  //     default:
  //       // statements_def
  //       break;
  //   }
  // }

  handleMove(horizontal, vertical) {
    let i = 0;
    let j = 0;
    let isMoved = false;

    if (horizontal != 0) {
      j = horizontal > 0 ? (j = 3) : (j = 0);
    } else {
      i = vertical > 0 ? (i = 3) : (i = 0);
    }

    let tempj = j;

    for (; i < 4 && i >= 0; vertical > 0 ? i-- : i++) {
      for (j = tempj; j < 4 && j >= 0; horizontal > 0 ? j-- : j++) {
        console.log("(i,j)", i, j);
        let field = this.fieldArray[i][j];
        if (field.value > 0) {
          let newX = i + vertical;
          let newY = j + horizontal;
          while (
            this.isOnBoard(newX, newY) &&
            (this.fieldArray[newX][newY].value == field.value ||
              this.fieldArray[newX][newY].value == 0)
          ) {
            let isEqualValue = this.fieldArray[newX][newY].value == field.value;
            isMoved = true;
            this.moveTile(field, newX, newY, isEqualValue);
            field = this.fieldArray[newX][newY];
            newX += vertical;
            newY += horizontal;
            console.log("while içinde");
            console.log("yeni x ve y", newX, newY);
            console.log();
          }
        }
      }
    }

    if (isMoved) {
      this.addRandom();
    }
  }

  moveTile(field, x, y, isEqualValue) {
    let newField = this.fieldArray[x][y];
    console.log("old field value", field.value);
    if (isEqualValue) {
      let value = newField.value + field.value;

      console.log("field value: ", field.value);

      field.tileSprite.setVisible(false);
      field.tileText.setVisible(false);
      field.value = 0;
      field.tileText.setText(0);

      newField.tileSprite.setVisible(true);
      newField.tileText.setVisible(true);
      newField.value = value;
      newField.tileText.setText(value);
    } else {
      newField.tileSprite.setVisible(true);
      newField.tileText.setVisible(true);
      newField.value = field.value;
      newField.tileText.setText(field.value);

      field.tileSprite.setVisible(false);
      field.tileText.setVisible(false);
      field.value = 0;
      field.tileText.setText(0);
    }
    this.scene.add.tween({
      targets: [newField.tileSprite, newField.tileText],
      alpha: { value: 1, duration: 100 }
    });

    this.scene.add.tween({
      targets: [field.tileSprite, field.tileText],
      alpha: { value: 0, duration: 100 }
    });
  }

  isOnBoard(x, y) {
    let checkX = x >= 0 && x < 4 ? true : false;
    let checkY = y >= 0 && y < 4 ? true : false;

    return checkX && checkY;
  }

  addRandom() {
    let emptyFields = [];
    this.fieldArray.forEach(function(fields) {
      fields.forEach(function(field) {
        if (field.value == 0) emptyFields.push(field);
      });
    });

    let field = Phaser.Utils.Array.GetRandom(emptyFields);
    field.tileSprite.setVisible(true);
    field.tileText.setVisible(true);
    field.tileText.setText("3");
    this.scene.add.tween({
      targets: [field.tileSprite, field.tileText],
      alpha: { value: 1, duration: 1000, ease: "Bounce" }
    });

    field.value = 3;
  }

  _buildHitArea() {
    this.scene.input.on("pointerdown", pointer => {
      const { x: downX, y: downY } = pointer;

      this.scene.input.on("pointerup", () => {
        this.scene.input.off("pointerup");
        const { x: upX, y: upY } = pointer;

        let difX = upX - downX;
        let difY = upY - downY;
        if (difX > 0 && difX > difY) {
          console.log("right");
          this.handleMove(1, 0);
        } else if (difX < 0 && Math.abs(difX) >= Math.abs(difY)) {
          console.log("left");
          this.handleMove(-1, 0);
        } else if (difY > 0 && Math.abs(difX) < Math.abs(difY)) {
          console.log("down");
          this.handleMove(0, 1);
        } else if (difY < 0 && Math.abs(difX) <= Math.abs(difY)) {
          console.log("up");
          this.handleMove(0, -1);
        }
      });
    });
  }

  update(delta) {}
}
