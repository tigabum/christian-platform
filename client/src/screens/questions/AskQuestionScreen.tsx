import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import api from '../../api/axios';
import {User} from '../../types/user.ts';

const AskQuestionScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [responders, setResponders] = useState<User[]>([]);
  const [selectedResponderId, setSelectedResponderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingResponders, setFetchingResponders] = useState(true);

  useEffect(() => {
    fetchResponders();
  }, []);

  const fetchResponders = async () => {
    try {
      const response = await api.get('/users/responders');
      console.log('Received responders:', response.data);
      setResponders(response.data);
    } catch (error) {
      console.error('Error fetching responders:', error);
    } finally {
      setFetchingResponders(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);

      // First create the question
      const questionResponse = await api.post('/questions', {
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
      });

      // If a responder was selected, assign the question
      if (selectedResponderId) {
        await api.patch(`/questions/${questionResponse.data._id}/assign`, {
          responderId: selectedResponderId,
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error creating/assigning question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What's your question about?"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Provide more details about your question..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.optionsContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Ask Anonymously</Text>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isAnonymous ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.responderSection}>
          <Text style={styles.sectionTitle}>Select Responder (Optional)</Text>
          {fetchingResponders ? (
            <ActivityIndicator style={styles.loader} color="#007AFF" />
          ) : (
            <View style={styles.respondersGrid}>
              {responders.map(responder => (
                <TouchableOpacity
                  key={responder._id}
                  style={[
                    styles.responderCard,
                    selectedResponderId === responder._id &&
                      styles.selectedResponder,
                  ]}
                  onPress={() => setSelectedResponderId(responder._id)}>
                  <Text style={styles.responderName}>{responder.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!title.trim() || !content.trim() || loading) &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!title.trim() || !content.trim() || loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Question</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    color: '#333',
  },
  contentInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 120,
    color: '#333',
  },
  optionsContainer: {
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  responderSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  respondersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 10,
  },
  responderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '48%', // Two cards per row with gap
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  selectedResponder: {
    backgroundColor: '#e3efff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  responderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AskQuestionScreen;
