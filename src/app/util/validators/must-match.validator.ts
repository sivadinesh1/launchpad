import { FormGroup } from '@angular/forms';

// custom validator to check that two fields match
export function MustMatch(group: FormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true };

}

 