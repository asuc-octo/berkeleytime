from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import (UserCreationForm, AuthenticationForm,
    PasswordResetForm, PasswordChangeForm, SetPasswordForm, SetPasswordForm)
from account.models import BerkeleytimeUserProfile
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import UNUSABLE_PASSWORD_PREFIX, identify_hasher

class BerkeleytimeUserCreationForm(UserCreationForm):
    """
    UserCreationForm for a BerkeleyTime user.
    """
    error_messages = {
        'duplicate_username': ("This username has already been taken."),
        'password_mismatch': ("The two password fields didn't match."),
    }
    username = forms.CharField(
        error_messages={'required': 'You must enter a username to register!'},
        widget=forms.TextInput(attrs={"placeholder": "username"})
    )
    password1 = forms.CharField(
        error_messages={'required': 'You must enter a password to register!'},
        widget=forms.PasswordInput(attrs={"placeholder": "password"})
    )
    password2 = forms.CharField(
        error_messages={'required': 'Try entering'},
        widget=forms.PasswordInput(attrs={"placeholder": "confirm password"})
    )
    email = forms.EmailField(
        required=True, error_messages={'required': 'You must enter an email to register!'},
        widget=forms.TextInput(attrs={"placeholder": "email address"})
    )
    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(BerkeleytimeUserCreationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

    def clean_email(self):
        email = self.cleaned_data.get('email')
        username = self.cleaned_data.get('username')
        if email and User.objects.filter(email=email).exclude(username=username).count():
            raise forms.ValidationError(u'It seems like this email is already taken!')
        return email

    def clean_password2(self):
        password = super(BerkeleytimeUserCreationForm, self).clean_password2()
        if password and len(password) < 6:
            raise forms.ValidationError(u'Your password needs to be 6 chars or more.')
        return password

class BerkeleytimeAuthenticationForm(AuthenticationForm):
    error_messages = {
        'invalid_login': ('Your username or password was incorrect'),
        'no_cookies': ("Enable your cookies to log in!"),
        'inactive': ("This account is inactive."),
    }
    username = forms.CharField(
        error_messages={'required': u'You must enter a username to login!'},
        widget=forms.TextInput(attrs={"placeholder": "username"})
    )
    password = forms.CharField(
        error_messages={'required': u'You must enter a password to login!'},
        widget=forms.PasswordInput(attrs={"placeholder": "password"})
    )

class BerkeleytimePasswordResetForm(PasswordResetForm):
    error_messages = {
        'unknown': "We couldn't find your email address anywhere. Are you sure you're registered?",
        'unusable': "Unfortunately, we can not reset the password of this account right now."
    }

    email = forms.EmailField(
        error_messages={'required': 'Sorry, you must enter an email address to reset your password.'},
        widget=forms.TextInput(attrs={"placeholder": "enter your email address"})
    )
    def clean_email(self):
        UserModel = get_user_model()
        email = self.cleaned_data["email"]
        self.users_cache = UserModel._default_manager.filter(email__iexact=email)
        if not len(self.users_cache):
            raise forms.ValidationError(self.error_messages['unknown'])
        if not any(user.is_active for user in self.users_cache):
            # none of the filtered users are active
            raise forms.ValidationError(self.error_messages['unknown'])
        if any((user.password.startswith(UNUSABLE_PASSWORD_PREFIX))
               for user in self.users_cache):
            raise forms.ValidationError(self.error_messages['unusable'])
        if email and BerkeleytimeUserProfile.objects.filter(user__email=email, facebook_id__isnull=False).exists():
            raise forms.ValidationError(u'Unfortunately, We can\'t reset passwords for accounts associated with Facebook.')
        return email

class BerkeleytimePasswordChangeForm(PasswordChangeForm):
    error_messages = {
        'password_incorrect': "Sorry, Your old password was incorrect.",
        'password_mismatch': "Your new passwords did not match."
    }
    old_password = forms.CharField(
        error_messages={'required': 'You must enter your old password!'},
        widget=forms.PasswordInput(attrs={"placeholder": "old password"})
    )
    new_password1 = forms.CharField(
        error_messages={'required': 'You must enter a new password!'},
        widget=forms.PasswordInput(attrs={"placeholder": "new password"})
    )
    new_password2 = forms.CharField(
        error_messages={'required': 'You must confirm your new password!'},
        widget=forms.PasswordInput(attrs={"placeholder": "confirm password"})
    )

    def clean_new_password2(self):
        new_password = super(BerkeleytimePasswordChangeForm, self).clean_new_password2()
        old_password = self.cleaned_data.get('old_password')
        if new_password and len(new_password) < 6:
            pass
            raise forms.ValidationError(u'Your password needs to be 6 chars or more.')
        if new_password and old_password and new_password == old_password:
            raise forms.ValidationError(u'Your new password must be different!')
        return new_password

class SetBerkeleytimePasswordForm(SetPasswordForm):
    error_messages = {
        'password_mismatch': "Your new passwords did not match."
    }

    new_password1 = forms.CharField(
        error_messages={'required': 'You must enter a new password!'},
        widget=forms.PasswordInput(attrs={"placeholder": "new password"})
    )
    new_password2 = forms.CharField(
        error_messages={'required': 'You must confirm your new password!'},
        widget=forms.PasswordInput(attrs={"placeholder": "confirm new password"})
    )

    def clean_new_password2(self):
        new_password = super(SetBerkeleytimePasswordForm, self).clean_new_password2()
        if new_password and len(new_password) < 6:
            raise forms.ValidationError(u'Your password needs at least 6 characters.')
        return new_password
