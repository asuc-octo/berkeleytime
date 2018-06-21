"""Foreign Language resource."""
import universal_csv

class ForeignLanguageResource():
    """Foreign Language Resource."""

    def get(self):
        """Return a foreign language definition."""
        return universal_csv.handler('data/foreign_language/processed/spring_2017/foreign_language.csv')


foreign_language_resource = ForeignLanguageResource()
