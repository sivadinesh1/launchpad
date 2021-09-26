npx stylelint "\*_/_.scss" --fix

npm run lint -- --fix

./node*modules/.bin/stylelint "\**/\_.scss" --fix

IonicModule.forRoot({animated: false});

To only disable page transition animations, while leaving the rest of the animations alone, add animated="false" to the <ion-router-outlet>:

<ion-router-outlet id="main-content" animated="false"></ion-router-outlet>

For people who want to control specified page only, you can use NavController of Ionic4 giving { animated: false } as NavigationOptions.

import { NavController } from '@ionic/angular';

constructor(public navCtrl: NavController,) {}

this.navCtrl.navigateForward(path, { animated: false });
